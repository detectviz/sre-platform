package main

import (
	"errors"
	"sync"
)

var (
	// ErrReportNotFound 在找不到指定報告時回傳。
	ErrReportNotFound = errors.New("analysis report not found")
	// ErrReportAlreadyExists 在重複建立相同報告編號時回傳。
	ErrReportAlreadyExists = errors.New("analysis report already exists")
)

// ReportRepository 定義報告儲存介面。
type ReportRepository interface {
	Create(report AnalysisReport) (AnalysisReport, error)
	Get(reportID string) (AnalysisReport, error)
	Update(reportID string, updater func(report *AnalysisReport) error) (AnalysisReport, error)
}

// InMemoryReportRepository 使用記憶體儲存報告，適用於原型開發。
type InMemoryReportRepository struct {
	mu         sync.RWMutex
	reports    map[string]*AnalysisReport
	eventIndex map[string]string
}

// NewInMemoryReportRepository 建立記憶體儲存庫實例。
func NewInMemoryReportRepository() *InMemoryReportRepository {
	return &InMemoryReportRepository{
		reports:    make(map[string]*AnalysisReport),
		eventIndex: make(map[string]string),
	}
}

// Create 新增報告記錄。
func (r *InMemoryReportRepository) Create(report AnalysisReport) (AnalysisReport, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.reports[report.ReportID]; exists {
		return AnalysisReport{}, ErrReportAlreadyExists
	}

	if report.EventID != "" {
		if existingID, ok := r.eventIndex[report.EventID]; ok {
			if existing, exists := r.reports[existingID]; exists {
				return existing.Clone(), ErrReportAlreadyExists
			}
		}
	}

	clone := report.Clone()
	r.reports[report.ReportID] = &clone
	if report.EventID != "" {
		r.eventIndex[report.EventID] = report.ReportID
	}
	return clone.Clone(), nil
}

// Get 依報告編號取得報告。
func (r *InMemoryReportRepository) Get(reportID string) (AnalysisReport, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	report, ok := r.reports[reportID]
	if !ok {
		return AnalysisReport{}, ErrReportNotFound
	}
	return report.Clone(), nil
}

// Update 以閉包更新報告內容。
func (r *InMemoryReportRepository) Update(reportID string, updater func(report *AnalysisReport) error) (AnalysisReport, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	report, ok := r.reports[reportID]
	if !ok {
		return AnalysisReport{}, ErrReportNotFound
	}

	if err := updater(report); err != nil {
		return AnalysisReport{}, err
	}

	// 以更新後的資料替換並回傳副本。
	updated := report.Clone()
	r.reports[reportID] = &updated
	if updated.EventID != "" {
		r.eventIndex[updated.EventID] = reportID
	}
	return updated.Clone(), nil
}
