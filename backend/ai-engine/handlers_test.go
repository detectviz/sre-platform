package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestCreateReportEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)

	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{result: &GeneratedReport{}}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})
	router := SetupRouter(service)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/events/evt-123/ai-analysis", strings.NewReader("{}"))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusAccepted {
		t.Fatalf("預期回傳 202，實際為 %d", resp.Code)
	}

	var body createAnalysisResponse
	if err := json.Unmarshal(resp.Body.Bytes(), &body); err != nil {
		t.Fatalf("無法解析回應: %v", err)
	}
	if body.ReportID == "" {
		t.Fatalf("回應需包含 report_id")
	}
	if body.Status != ReportStatusPending {
		t.Fatalf("預期初始狀態為 PENDING，實際為 %s", body.Status)
	}
}

func TestGetReportEndpointSuccess(t *testing.T) {
	gin.SetMode(gin.TestMode)

	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{result: &GeneratedReport{
		EventSummary:      "測試事件",
		RootCauseAnalysis: RootCauseAnalysis{Text: "測試"},
		ImpactAssessment:  ImpactAssessment{Text: "測試"},
	}}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})
	router := SetupRouter(service)

	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/events/evt-200/ai-analysis", strings.NewReader("{}"))
	createReq.Header.Set("Content-Type", "application/json")
	createResp := httptest.NewRecorder()
	router.ServeHTTP(createResp, createReq)

	if createResp.Code != http.StatusAccepted {
		t.Fatalf("建立報告應回傳 202，實際為 %d", createResp.Code)
	}

	var creation createAnalysisResponse
	if err := json.Unmarshal(createResp.Body.Bytes(), &creation); err != nil {
		t.Fatalf("解析建立回應失敗: %v", err)
	}

	service.Wait()

	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/ai/analysis-reports/"+creation.ReportID, nil)
	getResp := httptest.NewRecorder()
	router.ServeHTTP(getResp, getReq)

	if getResp.Code != http.StatusOK {
		t.Fatalf("預期回傳 200，實際為 %d", getResp.Code)
	}

	var report AnalysisReport
	if err := json.Unmarshal(getResp.Body.Bytes(), &report); err != nil {
		t.Fatalf("解析報告回應失敗: %v", err)
	}

	if report.Status != ReportStatusSuccess {
		t.Fatalf("預期狀態為 SUCCESS，實際為 %s", report.Status)
	}
	if report.ReportID != creation.ReportID {
		t.Fatalf("回傳的報告編號不符")
	}
	if report.RootCauseAnalysis == nil {
		t.Fatalf("回傳結果應包含 root_cause_analysis")
	}
}

func TestGetReportNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})
	router := SetupRouter(service)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/ai/analysis-reports/unknown", nil)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusNotFound {
		t.Fatalf("預期回傳 404，實際為 %d", resp.Code)
	}
}

func TestCreateReportEndpointConflict(t *testing.T) {
	gin.SetMode(gin.TestMode)

	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{result: &GeneratedReport{}}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})
	router := SetupRouter(service)

	firstReq := httptest.NewRequest(http.MethodPost, "/api/v1/events/evt-dup/ai-analysis", strings.NewReader("{}"))
	firstReq.Header.Set("Content-Type", "application/json")
	firstResp := httptest.NewRecorder()
	router.ServeHTTP(firstResp, firstReq)

	if firstResp.Code != http.StatusAccepted {
		t.Fatalf("第一次呼叫應回傳 202，實際為 %d", firstResp.Code)
	}

	var firstPayload createAnalysisResponse
	if err := json.Unmarshal(firstResp.Body.Bytes(), &firstPayload); err != nil {
		t.Fatalf("解析第一次回應失敗: %v", err)
	}

	secondReq := httptest.NewRequest(http.MethodPost, "/api/v1/events/evt-dup/ai-analysis", strings.NewReader("{}"))
	secondReq.Header.Set("Content-Type", "application/json")
	secondResp := httptest.NewRecorder()
	router.ServeHTTP(secondResp, secondReq)

	if secondResp.Code != http.StatusConflict {
		t.Fatalf("重複呼叫應回傳 409，實際為 %d", secondResp.Code)
	}

	var conflict conflictResponse
	if err := json.Unmarshal(secondResp.Body.Bytes(), &conflict); err != nil {
		t.Fatalf("解析衝突回應失敗: %v", err)
	}

	if conflict.ReportID != firstPayload.ReportID {
		t.Fatalf("衝突回應應回傳相同的 report_id")
	}
	if conflict.Error != "分析報告已存在" {
		t.Fatalf("預期錯誤訊息為 '分析報告已存在'，實際為 %s", conflict.Error)
	}
	if conflict.Status == "" {
		t.Fatalf("衝突回應應包含現有報告狀態")
	}
}

func TestCreateReportInvalidJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)

	repo := NewInMemoryReportRepository()
	generator := &stubGenerator{}
	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{ProcessingTimeout: time.Second})
	router := SetupRouter(service)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/events/evt-123/ai-analysis", strings.NewReader("{"))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusBadRequest {
		t.Fatalf("預期回傳 400，實際為 %d", resp.Code)
	}
}
