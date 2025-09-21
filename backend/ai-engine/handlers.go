package main

import (
	"errors"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SetupRouter 建立路由設定。
func SetupRouter(service *AnalysisService) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())

	handler := &analysisHandler{service: service}

	api := router.Group("/api/v1")
	{
		events := api.Group("/events")
		events.POST("/:eventId/ai-analysis", handler.createAnalysisReport)
	}

	ai := api.Group("/ai")
	{
		ai.GET("/analysis-reports/:reportId", handler.getAnalysisReport)
	}

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return router
}

type analysisHandler struct {
	service *AnalysisService
}

type createAnalysisResponse struct {
	ReportID string       `json:"report_id"`
	Status   ReportStatus `json:"status"`
}

type errorResponse struct {
	Error string `json:"error"`
}

type conflictResponse struct {
	Error    string       `json:"error"`
	ReportID string       `json:"report_id,omitempty"`
	Status   ReportStatus `json:"status,omitempty"`
}

func (h *analysisHandler) createAnalysisReport(c *gin.Context) {
	eventID := c.Param("eventId")
	var req CreateAnalysisRequest
	if c.Request.Body != nil {
		if err := c.ShouldBindJSON(&req); err != nil {
			if !errors.Is(err, io.EOF) {
				c.JSON(http.StatusBadRequest, errorResponse{Error: "請提供有效的 JSON 請求"})
				return
			}
		}
	}

	report, err := h.service.CreateReport(c.Request.Context(), eventID, req)
	if err != nil {
		switch {
		case errors.Is(err, ErrEventIDRequired):
			c.JSON(http.StatusBadRequest, errorResponse{Error: "請提供有效的事件編號"})
		case errors.Is(err, ErrReportAlreadyExists):
			c.JSON(http.StatusConflict, conflictResponse{Error: "分析報告已存在", ReportID: report.ReportID, Status: report.Status})
		case errors.Is(err, ErrNoTemplates):
			c.JSON(http.StatusServiceUnavailable, errorResponse{Error: "暫無可用的分析模板"})
		default:
			c.JSON(http.StatusInternalServerError, errorResponse{Error: "建立分析報告時發生錯誤"})
		}
		return
	}

	c.JSON(http.StatusAccepted, createAnalysisResponse{ReportID: report.ReportID, Status: report.Status})
}

func (h *analysisHandler) getAnalysisReport(c *gin.Context) {
	reportID := c.Param("reportId")
	report, err := h.service.GetReport(c.Request.Context(), reportID)
	if err != nil {
		if errors.Is(err, ErrReportNotFound) {
			c.JSON(http.StatusNotFound, errorResponse{Error: "找不到分析報告"})
			return
		}
		if errors.Is(err, ErrReportIDRequired) {
			c.JSON(http.StatusBadRequest, errorResponse{Error: "請提供有效的報告編號"})
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse{Error: "查詢分析報告時發生錯誤"})
		return
	}

	c.JSON(http.StatusOK, report)
}
