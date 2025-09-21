package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"hash/crc32"
	"os"
	"time"
)

// ErrNoTemplates 表示缺少可用的模板資料。
var ErrNoTemplates = errors.New("no analysis templates configured")

// TemplateReportGenerator 透過預設模板模擬 LLM 回應。
type TemplateReportGenerator struct {
	templates []GeneratedReport
	delay     time.Duration
}

type promptData struct {
	AnalysisTemplates []GeneratedReport `json:"analysis_templates"`
}

// NewTemplateReportGenerator 從 JSON 模板檔案初始化產生器。
func NewTemplateReportGenerator(path string, delay time.Duration) (*TemplateReportGenerator, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("無法讀取 prompts 檔案: %w", err)
	}

	var data promptData
	if err := json.Unmarshal(raw, &data); err != nil {
		return nil, fmt.Errorf("無法解析 prompts 檔案: %w", err)
	}

	if len(data.AnalysisTemplates) == 0 {
		return nil, ErrNoTemplates
	}

	templates := make([]GeneratedReport, len(data.AnalysisTemplates))
	for i, tpl := range data.AnalysisTemplates {
		templates[i] = tpl.Clone()
	}

	return &TemplateReportGenerator{
		templates: templates,
		delay:     delay,
	}, nil
}

// Generate 根據事件編號輸出對應的模板，模擬耗時作業。
func (g *TemplateReportGenerator) Generate(ctx context.Context, input GenerationInput) (*GeneratedReport, error) {
	if len(g.templates) == 0 {
		return nil, ErrNoTemplates
	}

	if g.delay > 0 {
		select {
		case <-time.After(g.delay):
		case <-ctx.Done():
			return nil, ctx.Err()
		}
	}

	index := 0
	if input.EventID != "" {
		index = int(crc32.ChecksumIEEE([]byte(input.EventID))) % len(g.templates)
	}

	payload := g.templates[index].Clone()
	if payload.EventSummary == "" && input.EventID != "" {
		payload.EventSummary = fmt.Sprintf("事件 %s 的分析報告", input.EventID)
	}

	return &payload, nil
}
