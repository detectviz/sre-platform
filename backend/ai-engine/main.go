package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// PromptCatalog 代表靜態提示資料的集合。
type PromptCatalog struct {
	Events []PromptTemplate `json:"events"`
}

// PromptTemplate 描述單一事件的提示內容。
type PromptTemplate struct {
	EventID string `json:"event_id"`
	Title   string `json:"title"`
	Prompt  string `json:"prompt"`
}

// ReportSection 代表分析報告中的單一段落。
type ReportSection struct {
	Heading string `json:"heading"`
	Content string `json:"content"`
}

// AnalysisReport 為回傳前端的分析報告資料結構。
type AnalysisReport struct {
	EventID     string          `json:"event_id"`
	GeneratedAt time.Time       `json:"generated_at"`
	PromptTitle string          `json:"prompt_title"`
	PromptText  string          `json:"prompt_text"`
	Summary     string          `json:"summary"`
	Sections    []ReportSection `json:"sections"`
	RawResponse string          `json:"raw_response"`
}

// LlmResponse 用於解析 LLM API 的常見回傳格式。
type LlmResponse struct {
	Choices []struct {
		Text    string `json:"text"`
		Message struct {
			Content string `json:"content"`
			Parts   []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"message"`
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	} `json:"choices"`
	OutputText string `json:"output_text"`
	Output     []struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

// LlmClient 負責與外部 LLM API 溝通。
type LlmClient struct {
	Endpoint   string
	APIKey     string
	Model      string
	HTTPClient *http.Client
}

// AppContext 保存伺服器執行所需的共用資源。
type AppContext struct {
	Prompts map[string]PromptTemplate
	Client  *LlmClient
}

func main() {
	gin.SetMode(gin.ReleaseMode)

	prompts, err := loadPromptCatalog(resolvePromptFilePath())
	if err != nil {
		log.Fatalf("讀取提示檔案失敗: %v", err)
	}

	client := newLlmClient()
	app := &AppContext{
		Prompts: prompts,
		Client:  client,
	}

	router := gin.Default()
	router.GET("/api/v1/events/:eventId/analysis-report", app.handleGetAnalysisReport)
	router.POST("/api/v1/events/:eventId/analysis", handlePostAnalysis)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("啟動 HTTP 伺服器失敗: %v", err)
	}
}

// handleGetAnalysisReport 處理分析報告查詢請求。
func (app *AppContext) handleGetAnalysisReport(c *gin.Context) {
	eventID := c.Param("eventId")
	prompt, ok := app.Prompts[eventID]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"error":    "找不到對應的事件提示資料",
			"event_id": eventID,
		})
		return
	}

	reportText, rawBody, err := app.Client.RequestAnalysis(c.Request.Context(), prompt)
	if err != nil {
		log.Printf("向 LLM 取得分析報告失敗: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"error":   "無法取得外部 LLM 回應",
			"details": err.Error(),
		})
		return
	}

	report := buildAnalysisReport(prompt, reportText, rawBody)
	report.EventID = eventID

	c.JSON(http.StatusOK, report)
}

// handlePostAnalysis 保留原有分析觸發端點。
func handlePostAnalysis(c *gin.Context) {
	c.JSON(http.StatusAccepted, gin.H{
		"message": "分析任務已建立，稍後回傳結果",
	})
}

// loadPromptCatalog 從 JSON 檔案載入提示內容。
func loadPromptCatalog(filePath string) (map[string]PromptTemplate, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("讀取檔案失敗: %w", err)
	}

	var catalog PromptCatalog
	if err := json.Unmarshal(data, &catalog); err != nil {
		return nil, fmt.Errorf("解析 JSON 失敗: %w", err)
	}

	prompts := make(map[string]PromptTemplate)
	for _, item := range catalog.Events {
		prompts[item.EventID] = item
	}

	if len(prompts) == 0 {
		return nil, errors.New("提示內容為空")
	}

	return prompts, nil
}

// resolvePromptFilePath 依序尋找預設的提示檔案路徑。
func resolvePromptFilePath() string {
	if custom, ok := os.LookupEnv("PROMPT_FILE_PATH"); ok && custom != "" {
		return custom
	}

	if wd, err := os.Getwd(); err == nil {
		candidate := filepath.Join(wd, "data", "prompts.json")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
		candidate = filepath.Join(wd, "backend", "ai-engine", "data", "prompts.json")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}

	if execPath, err := os.Executable(); err == nil {
		base := filepath.Dir(execPath)
		candidate := filepath.Join(base, "data", "prompts.json")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}

	return filepath.Join("data", "prompts.json")
}

// newLlmClient 建立預設的 LLM 客戶端。
func newLlmClient() *LlmClient {
	endpoint := os.Getenv("LLM_API_URL")
	if endpoint == "" {
		endpoint = "https://api.example-llm.com/v1/completions"
	}

	model := os.Getenv("LLM_MODEL_ID")
	if model == "" {
		model = "example-model-large"
	}

	return &LlmClient{
		Endpoint: endpoint,
		APIKey:   os.Getenv("LLM_API_KEY"),
		Model:    model,
		HTTPClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// RequestAnalysis 對外部 LLM 發送請求並取得文字結果與原始回應。
func (c *LlmClient) RequestAnalysis(ctx context.Context, prompt PromptTemplate) (string, string, error) {
	payload := map[string]any{
		"model":       c.Model,
		"prompt":      prompt.Prompt,
		"temperature": 0.2,
		"max_tokens":  800,
		"metadata": map[string]string{
			"event_id": prompt.EventID,
			"title":    prompt.Title,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", "", fmt.Errorf("序列化請求資料失敗: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.Endpoint, bytes.NewReader(body))
	if err != nil {
		return "", "", fmt.Errorf("建立 HTTP 請求失敗: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("呼叫 LLM 端點失敗: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", fmt.Errorf("讀取 LLM 回應失敗: %w", err)
	}

	if resp.StatusCode >= 400 {
		return "", string(respBody), fmt.Errorf("LLM 回傳錯誤狀態碼 %d", resp.StatusCode)
	}

	text := extractTextFromLlmResponse(respBody)
	if text == "" {
		text = string(respBody)
	}

	return text, string(respBody), nil
}

// extractTextFromLlmResponse 嘗試解析常見 LLM 回應格式以擷取文字內容。
func extractTextFromLlmResponse(body []byte) string {
	var response LlmResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return ""
	}

	for _, choice := range response.Choices {
		if strings.TrimSpace(choice.Text) != "" {
			return strings.TrimSpace(choice.Text)
		}
		if strings.TrimSpace(choice.Message.Content) != "" {
			return strings.TrimSpace(choice.Message.Content)
		}
		for _, part := range choice.Message.Parts {
			if strings.TrimSpace(part.Text) != "" {
				return strings.TrimSpace(part.Text)
			}
		}
		for _, part := range choice.Content {
			if strings.TrimSpace(part.Text) != "" {
				return strings.TrimSpace(part.Text)
			}
		}
	}

	if strings.TrimSpace(response.OutputText) != "" {
		return strings.TrimSpace(response.OutputText)
	}

	for _, item := range response.Output {
		for _, part := range item.Content {
			if strings.TrimSpace(part.Text) != "" {
				return strings.TrimSpace(part.Text)
			}
		}
	}

	for _, candidate := range response.Candidates {
		for _, part := range candidate.Content.Parts {
			if strings.TrimSpace(part.Text) != "" {
				return strings.TrimSpace(part.Text)
			}
		}
	}

	return ""
}

// buildAnalysisReport 根據 LLM 的文字內容整理出報告結構。
func buildAnalysisReport(prompt PromptTemplate, reportText string, rawBody string) AnalysisReport {
	paragraphs := splitParagraphs(reportText)
	sections := make([]ReportSection, 0, len(paragraphs))
	for idx, paragraph := range paragraphs {
		sections = append(sections, ReportSection{
			Heading: fmt.Sprintf("段落 %d", idx+1),
			Content: paragraph,
		})
	}

	summary := ""
	if len(paragraphs) > 0 {
		summary = paragraphs[0]
	}

	return AnalysisReport{
		PromptTitle: prompt.Title,
		PromptText:  prompt.Prompt,
		Summary:     summary,
		Sections:    sections,
		RawResponse: rawBody,
		GeneratedAt: time.Now().UTC(),
	}
}

// splitParagraphs 將文字依空白行分段。
func splitParagraphs(text string) []string {
	normalized := strings.ReplaceAll(text, "\r\n", "\n")
	blocks := strings.Split(normalized, "\n\n")
	paragraphs := make([]string, 0, len(blocks))
	for _, block := range blocks {
		trimmed := strings.TrimSpace(block)
		if trimmed != "" {
			paragraphs = append(paragraphs, trimmed)
		}
	}

	if len(paragraphs) == 0 {
		trimmed := strings.TrimSpace(normalized)
		if trimmed != "" {
			paragraphs = append(paragraphs, trimmed)
		}
	}

	return paragraphs
}
