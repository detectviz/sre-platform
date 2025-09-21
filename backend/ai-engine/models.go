package main

import (
	"encoding/json"
	"time"
)

// ReportStatus 代表 AI 分析報告的狀態。
type ReportStatus string

const (
	ReportStatusPending ReportStatus = "PENDING"
	ReportStatusRunning ReportStatus = "RUNNING"
	ReportStatusSuccess ReportStatus = "SUCCESS"
	ReportStatusFailed  ReportStatus = "FAILED"
)

// EvidenceLink 描述可供驗證的外部連結。
type EvidenceLink struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// EvidenceItem 收集 AI 分析過程中引用的證據資料。
type EvidenceItem struct {
	Type        string         `json:"type"`
	Description string         `json:"description"`
	Link        *EvidenceLink  `json:"link,omitempty"`
	Timestamp   *time.Time     `json:"timestamp,omitempty"`
	Metadata    map[string]any `json:"metadata,omitempty"`
}

// RootCauseAnalysis 說明根本原因與系統推論。
type RootCauseAnalysis struct {
	Text            string         `json:"text"`
	ConfidenceScore float64        `json:"confidence_score"`
	ProbableCauses  []string       `json:"probable_causes,omitempty"`
	Evidence        []EvidenceItem `json:"evidence,omitempty"`
}

// AffectedResource 代表受影響的資源。
type AffectedResource struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type,omitempty"`
	Role string `json:"role,omitempty"`
}

// ImpactAssessment 描述事件影響範圍。
type ImpactAssessment struct {
	Text              string             `json:"text"`
	AffectedResources []AffectedResource `json:"affected_resources,omitempty"`
	UserImpact        string             `json:"user_impact,omitempty"`
	DurationMinutes   int                `json:"duration_minutes,omitempty"`
	Severity          string             `json:"severity,omitempty"`
}

// RecommendedAction 提供可執行的建議。
type RecommendedAction struct {
	Title      string         `json:"title"`
	ActionType string         `json:"action_type"`
	Risk       string         `json:"risk"`
	Summary    string         `json:"summary,omitempty"`
	ActionData map[string]any `json:"action_data,omitempty"`
}

// AnalysisReport 為完整的 AI 事件分析報告。
type AnalysisReport struct {
	ReportID           string              `json:"report_id"`
	EventID            string              `json:"event_id"`
	Status             ReportStatus        `json:"status"`
	EventSummary       string              `json:"event_summary,omitempty"`
	RootCauseAnalysis  *RootCauseAnalysis  `json:"root_cause_analysis,omitempty"`
	ImpactAssessment   *ImpactAssessment   `json:"impact_assessment,omitempty"`
	RecommendedActions []RecommendedAction `json:"recommended_actions,omitempty"`
	Evidence           []EvidenceItem      `json:"evidence,omitempty"`
	ErrorMessage       string              `json:"error_message,omitempty"`
	CreatedAt          time.Time           `json:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at"`
	CompletedAt        *time.Time          `json:"completed_at,omitempty"`
	RawLLMResponse     json.RawMessage     `json:"raw_llm_response,omitempty"`
}

// Clone 建立報告的深拷貝，避免外部修改內部狀態。
func (r *AnalysisReport) Clone() AnalysisReport {
	if r == nil {
		return AnalysisReport{}
	}

	clone := *r

	if r.RootCauseAnalysis != nil {
		rootCopy := *r.RootCauseAnalysis
		rootCopy.ProbableCauses = append([]string(nil), r.RootCauseAnalysis.ProbableCauses...)
		rootCopy.Evidence = cloneEvidence(r.RootCauseAnalysis.Evidence)
		clone.RootCauseAnalysis = &rootCopy
	}

	if r.ImpactAssessment != nil {
		impactCopy := *r.ImpactAssessment
		impactCopy.AffectedResources = append([]AffectedResource(nil), r.ImpactAssessment.AffectedResources...)
		clone.ImpactAssessment = &impactCopy
	}

	clone.RecommendedActions = cloneRecommendedActions(r.RecommendedActions)
	clone.Evidence = cloneEvidence(r.Evidence)

	if r.RawLLMResponse != nil {
		clone.RawLLMResponse = append(json.RawMessage(nil), r.RawLLMResponse...)
	}

	if r.CompletedAt != nil {
		completed := *r.CompletedAt
		clone.CompletedAt = &completed
	}

	return clone
}

func cloneEvidence(items []EvidenceItem) []EvidenceItem {
	if len(items) == 0 {
		return nil
	}
	cloned := make([]EvidenceItem, len(items))
	for i, item := range items {
		copied := item
		if item.Link != nil {
			linkCopy := *item.Link
			copied.Link = &linkCopy
		}
		if item.Timestamp != nil {
			ts := *item.Timestamp
			copied.Timestamp = &ts
		}
		if item.Metadata != nil {
			metadataCopy := make(map[string]any, len(item.Metadata))
			for k, v := range item.Metadata {
				metadataCopy[k] = v
			}
			copied.Metadata = metadataCopy
		}
		cloned[i] = copied
	}
	return cloned
}

func cloneRecommendedActions(actions []RecommendedAction) []RecommendedAction {
	if len(actions) == 0 {
		return nil
	}
	cloned := make([]RecommendedAction, len(actions))
	for i, action := range actions {
		copied := action
		if action.ActionData != nil {
			dataCopy := make(map[string]any, len(action.ActionData))
			for k, v := range action.ActionData {
				dataCopy[k] = v
			}
			copied.ActionData = dataCopy
		}
		cloned[i] = copied
	}
	return cloned
}
