package main

import (
	"context"
	"errors"
	"testing"
	"time"
)

type stubGenerator struct {
	result *GeneratedReport
	err    error
}

func (s *stubGenerator) Generate(ctx context.Context, input GenerationInput) (*GeneratedReport, error) {
	if s.err != nil {
		return nil, s.err
	}
	if s.result == nil {
		return nil, nil
	}
	payload := s.result.Clone()
	return &payload, nil
}

func TestAnalysisServiceSuccessFlow(t *testing.T) {
	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{result: &GeneratedReport{
		EventSummary: "示範事件",
		RootCauseAnalysis: RootCauseAnalysis{
			Text:            "測試根本原因",
			ConfidenceScore: 0.9,
			Evidence: []EvidenceItem{{
				Type:        "METRIC",
				Description: "CPU 使用率上升",
			}},
		},
		ImpactAssessment: ImpactAssessment{
			Text: "造成登入延遲",
			AffectedResources: []AffectedResource{{
				ID:   "svc-1",
				Name: "service-a",
			}},
		},
		RecommendedActions: []RecommendedAction{{
			Title:      "重新部署",
			ActionType: "AUTOMATION",
			Risk:       "HIGH",
		}},
		Evidence: []EvidenceItem{{
			Type:        "LOG",
			Description: "error log",
		}},
		RawLLMResponse: []byte(`{"mock":true}`),
	}}

	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})

	draft, err := service.CreateReport(context.Background(), "evt-success", CreateAnalysisRequest{})
	if err != nil {
		t.Fatalf("建立報告草稿失敗: %v", err)
	}
	if draft.Status != ReportStatusPending {
		t.Fatalf("預期狀態為 PENDING，實際為 %s", draft.Status)
	}

	service.Wait()

	report, err := service.GetReport(context.Background(), draft.ReportID)
	if err != nil {
		t.Fatalf("取得報告失敗: %v", err)
	}

	if report.Status != ReportStatusSuccess {
		t.Fatalf("預期狀態為 SUCCESS，實際為 %s", report.Status)
	}
	if report.RootCauseAnalysis == nil || report.RootCauseAnalysis.Text == "" {
		t.Fatalf("應填入根本原因內容")
	}
	if len(report.RecommendedActions) == 0 {
		t.Fatalf("應至少包含一項建議措施")
	}
	if len(report.RawLLMResponse) == 0 {
		t.Fatalf("應保留原始 LLM 回應")
	}
}

func TestAnalysisServiceFailureFlow(t *testing.T) {
	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{err: errors.New("llm timeout")}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})

	draft, err := service.CreateReport(context.Background(), "evt-failed", CreateAnalysisRequest{})
	if err != nil {
		t.Fatalf("建立報告草稿失敗: %v", err)
	}

	service.Wait()

	report, err := service.GetReport(context.Background(), draft.ReportID)
	if err != nil {
		t.Fatalf("取得報告失敗: %v", err)
	}
	if report.Status != ReportStatusFailed {
		t.Fatalf("預期狀態為 FAILED，實際為 %s", report.Status)
	}
	if report.ErrorMessage == "" {
		t.Fatalf("失敗狀態應包含錯誤訊息")
	}
}

func TestAnalysisServiceGetReportNotFound(t *testing.T) {
	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{err: errors.New("llm not used")}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})

	_, err := service.GetReport(context.Background(), "unknown")
	if !errors.Is(err, ErrReportNotFound) {
		t.Fatalf("預期 ErrReportNotFound，實際為 %v", err)
	}
}

func TestCreateReportValidateEventID(t *testing.T) {
	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{})

	if _, err := service.CreateReport(context.Background(), "", CreateAnalysisRequest{}); !errors.Is(err, ErrEventIDRequired) {
		t.Fatalf("缺少事件編號應回傳 ErrEventIDRequired，實際為 %v", err)
	}
}

func TestCreateReportDuplicateEvent(t *testing.T) {
	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{result: &GeneratedReport{}}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})

	first, err := service.CreateReport(context.Background(), "evt-dup", CreateAnalysisRequest{})
	if err != nil {
		t.Fatalf("第一次建立報告應成功: %v", err)
	}

	duplicate, err := service.CreateReport(context.Background(), "evt-dup", CreateAnalysisRequest{})
	if !errors.Is(err, ErrReportAlreadyExists) {
		t.Fatalf("重複建立應回傳 ErrReportAlreadyExists，實際為 %v", err)
	}
	if duplicate.ReportID != first.ReportID {
		t.Fatalf("重複建立應回傳相同 report_id")
	}

	service.Wait()
}

func TestGetReportValidateReportID(t *testing.T) {
	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{})

	if _, err := service.GetReport(context.Background(), ""); !errors.Is(err, ErrReportIDRequired) {
		t.Fatalf("缺少報告編號應回傳 ErrReportIDRequired，實際為 %v", err)
	}
}
