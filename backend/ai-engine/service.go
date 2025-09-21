package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
)

const defaultProcessingTimeout = 45 * time.Second

var (
	// ErrEventIDRequired 代表建立報告時缺少事件編號。
	ErrEventIDRequired = errors.New("eventID is required")
	// ErrReportIDRequired 代表查詢報告時缺少報告編號。
	ErrReportIDRequired = errors.New("reportID is required")
)

// AnalysisServiceConfig 用於調整服務行為。
type AnalysisServiceConfig struct {
	ProcessingTimeout time.Duration
	Logger            *log.Logger
}

// CreateAnalysisRequest 為觸發分析時的輸入格式。
type CreateAnalysisRequest struct {
	EventContext map[string]any `json:"event_context,omitempty"`
}

// GenerationInput 傳遞給生成器的上下文資料。
type GenerationInput struct {
	EventID      string
	EventContext map[string]any
}

// GeneratedReport 代表 LLM 生成的報告內容。
type GeneratedReport struct {
	EventSummary       string              `json:"event_summary"`
	RootCauseAnalysis  RootCauseAnalysis   `json:"root_cause_analysis"`
	ImpactAssessment   ImpactAssessment    `json:"impact_assessment"`
	RecommendedActions []RecommendedAction `json:"recommended_actions"`
	Evidence           []EvidenceItem      `json:"evidence"`
	RawLLMResponse     json.RawMessage     `json:"raw_llm_response"`
}

// Clone 建立生成結果的副本。
func (g *GeneratedReport) Clone() GeneratedReport {
	if g == nil {
		return GeneratedReport{}
	}
	clone := *g
	clone.RootCauseAnalysis.ProbableCauses = append([]string(nil), g.RootCauseAnalysis.ProbableCauses...)
	clone.RootCauseAnalysis.Evidence = cloneEvidence(g.RootCauseAnalysis.Evidence)
	clone.ImpactAssessment.AffectedResources = append([]AffectedResource(nil), g.ImpactAssessment.AffectedResources...)
	clone.RecommendedActions = cloneRecommendedActions(g.RecommendedActions)
	clone.Evidence = cloneEvidence(g.Evidence)
	if g.RawLLMResponse != nil {
		clone.RawLLMResponse = append(json.RawMessage(nil), g.RawLLMResponse...)
	}
	return clone
}

// ReportGenerator 負責實際呼叫 LLM 或模擬資料。
type ReportGenerator interface {
	Generate(ctx context.Context, input GenerationInput) (*GeneratedReport, error)
}

// AnalysisService 負責協調報告的建立與非同步處理。
type AnalysisService struct {
	repo              ReportRepository
	generator         ReportGenerator
	processingTimeout time.Duration
	logger            *log.Logger
	wg                sync.WaitGroup
}

// NewAnalysisService 建立分析服務。
func NewAnalysisService(repo ReportRepository, generator ReportGenerator, cfg AnalysisServiceConfig) *AnalysisService {
	if repo == nil {
		panic("report repository is required")
	}
	if generator == nil {
		panic("report generator is required")
	}

	timeout := cfg.ProcessingTimeout
	if timeout <= 0 {
		timeout = defaultProcessingTimeout
	}

	logger := cfg.Logger
	if logger == nil {
		logger = log.Default()
	}

	return &AnalysisService{
		repo:              repo,
		generator:         generator,
		processingTimeout: timeout,
		logger:            logger,
	}
}

// CreateReport 建立新的分析報告草稿並觸發非同步處理。
func (s *AnalysisService) CreateReport(ctx context.Context, eventID string, req CreateAnalysisRequest) (AnalysisReport, error) {
	if eventID == "" {
		return AnalysisReport{}, ErrEventIDRequired
	}

	now := time.Now().UTC()
	report := AnalysisReport{
		ReportID:  uuid.NewString(),
		EventID:   eventID,
		Status:    ReportStatusPending,
		CreatedAt: now,
		UpdatedAt: now,
	}

	created, err := s.repo.Create(report)
	if err != nil {
		if errors.Is(err, ErrReportAlreadyExists) {
			return created, ErrReportAlreadyExists
		}
		return AnalysisReport{}, err
	}

	s.wg.Add(1)
	go func(reportID string, input GenerationInput) {
		defer s.wg.Done()
		s.runAnalysis(reportID, input)
	}(created.ReportID, GenerationInput{EventID: eventID, EventContext: req.EventContext})

	return created, nil
}

// GetReport 取得報告內容。
func (s *AnalysisService) GetReport(ctx context.Context, reportID string) (AnalysisReport, error) {
	if reportID == "" {
		return AnalysisReport{}, ErrReportIDRequired
	}
	return s.repo.Get(reportID)
}

// Wait 等待背景分析完成 (僅供測試使用)。
func (s *AnalysisService) Wait() {
	s.wg.Wait()
}

func (s *AnalysisService) runAnalysis(reportID string, input GenerationInput) {
	if _, err := s.repo.Update(reportID, func(report *AnalysisReport) error {
		report.Status = ReportStatusRunning
		report.ErrorMessage = ""
		report.UpdatedAt = time.Now().UTC()
		return nil
	}); err != nil {
		s.logger.Printf("無法更新報告狀態為 RUNNING: %v", err)
		return
	}

	ctx := context.Background()
	var cancel context.CancelFunc
	if s.processingTimeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, s.processingTimeout)
	} else {
		ctx, cancel = context.WithCancel(ctx)
	}
	defer cancel()

	result, err := s.generator.Generate(ctx, input)
	if err != nil {
		s.logger.Printf("AI 分析失敗 (report_id=%s): %v", reportID, err)
		now := time.Now().UTC()
		if _, updateErr := s.repo.Update(reportID, func(report *AnalysisReport) error {
			report.Status = ReportStatusFailed
			report.ErrorMessage = err.Error()
			report.CompletedAt = &now
			report.UpdatedAt = now
			return nil
		}); updateErr != nil {
			s.logger.Printf("無法更新失敗狀態 (report_id=%s): %v", reportID, updateErr)
		}
		return
	}

	payload := result.Clone()
	now := time.Now().UTC()
	if _, err := s.repo.Update(reportID, func(report *AnalysisReport) error {
		report.Status = ReportStatusSuccess
		report.EventSummary = payload.EventSummary
		report.RootCauseAnalysis = &payload.RootCauseAnalysis
		report.ImpactAssessment = &payload.ImpactAssessment
		report.RecommendedActions = payload.RecommendedActions
		report.Evidence = payload.Evidence
		report.RawLLMResponse = payload.RawLLMResponse
		report.ErrorMessage = ""
		report.CompletedAt = &now
		report.UpdatedAt = now
		return nil
	}); err != nil {
		s.logger.Printf("無法寫入成功報告 (report_id=%s): %v", reportID, err)
	}
}
