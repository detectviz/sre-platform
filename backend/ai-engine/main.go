package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	promptsPath := os.Getenv("AI_ENGINE_PROMPTS_PATH")
	if promptsPath == "" {
		promptsPath = "data/prompts.json"
	}

	repo := NewInMemoryReportRepository()
	generator, err := NewTemplateReportGenerator(promptsPath, 750*time.Millisecond)
	if err != nil {
		log.Fatalf("無法載入分析模板: %v", err)
	}

	service := NewAnalysisService(repo, generator, AnalysisServiceConfig{
		ProcessingTimeout: 2 * time.Minute,
	})

	router := SetupRouter(service)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	log.Printf("AI Engine 服務啟動於埠號 %s", port)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服務啟動失敗: %v", err)
	}
}
