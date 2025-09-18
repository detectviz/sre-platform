# SRE 平台監控與告警指南

## 📋 文檔概覽

**文檔版本**: 1.0
**更新日期**: 2024-09-18
**目標讀者**: SRE 工程師、DevOps 工程師、監控運維人員

## 📊 可觀測性概覽

SRE 平台採用現代化的可觀測性架構，基於「三大支柱」（指標、日誌、追蹤）構建全方位監控體系，實現從基礎設施到業務應用的完整可見性。

### 可觀測性架構
```mermaid
graph TB
    subgraph "📊 指標收集層 (Metrics)"
        Prometheus[Prometheus Server]
        VictoriaMetrics[VictoriaMetrics TSDB]
        NodeExporter[Node Exporter]
        AppMetrics[Application Metrics]
    end

    subghat "📝 日誌聚合層 (Logs)"
        Loki[Grafana Loki]
        Promtail[Promtail Agent]
        FluentBit[Fluent Bit]
        LogQL[LogQL Queries]
    end

    subgraph "🔗 分散式追蹤層 (Traces)"
        Jaeger[Jaeger Collector]
        OpenTelemetry[OpenTelemetry SDK]
        TraceQL[Trace Analysis]
    end

    subgraph "🚨 告警管理層 (Alerting)"
        AlertManager[Alert Manager]
        GrafanaAlerting[Grafana Alerting]
        NotificationChannels[通知渠道]
    end

    subgraph "📈 可視化層 (Visualization)"
        GrafanaDashboards[Grafana Dashboards]
        CustomUI[自定義監控 UI]
        MobileApp[移動端監控]
    end

    %% 數據流
    NodeExporter --> Prometheus
    AppMetrics --> Prometheus
    Prometheus --> VictoriaMetrics

    Promtail --> Loki
    FluentBit --> Loki
    Loki --> LogQL

    OpenTelemetry --> Jaeger
    Jaeger --> TraceQL

    Prometheus --> AlertManager
    VictoriaMetrics --> GrafanaAlerting
    AlertManager --> NotificationChannels

    VictoriaMetrics --> GrafanaDashboards
    LogQL --> GrafanaDashboards
    TraceQL --> GrafanaDashboards
    GrafanaDashboards --> CustomUI
```

## 📊 指標監控 (Metrics)

### Prometheus 配置

#### 基礎配置文件
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'sre-platform'
    environment: 'production'

rule_files:
  - "/etc/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # SRE 平台後端服務
  - job_name: 'sre-platform-backend'
    static_configs:
      - targets: ['sre-backend:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s
    scrape_timeout: 5s

  # 基礎設施監控
  - job_name: 'node-exporter'
    static_configs:
      - targets:
        - 'node-exporter-1:9100'
        - 'node-exporter-2:9100'
        - 'node-exporter-3:9100'

  # PostgreSQL 監控
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis 監控
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Kubernetes 監控
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### 自定義業務指標

#### Go 後端指標定義
```go
// metrics.go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    // HTTP 請求指標
    HTTPRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "sre_platform_http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status_code"},
    )

    HTTPRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "sre_platform_http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
        },
        []string{"method", "endpoint"},
    )

    // 業務邏輯指標
    EventsProcessedTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "sre_platform_events_processed_total",
            Help: "Total number of events processed",
        },
        []string{"event_type", "status"},
    )

    EventProcessingDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "sre_platform_event_processing_duration_seconds",
            Help:    "Event processing duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"event_type"},
    )

    // 系統健康指標
    DatabaseConnections = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "sre_platform_database_connections",
            Help: "Number of active database connections",
        },
        []string{"database", "state"},
    )

    CacheHitRate = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "sre_platform_cache_hit_rate",
            Help: "Cache hit rate percentage",
        },
        []string{"cache_type"},
    )
)
```

#### 指標中間件實現
```go
// metrics_middleware.go
func PrometheusMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()

        // 處理請求
        c.Next()

        // 記錄指標
        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Writer.Status())

        HTTPRequestsTotal.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            status,
        ).Inc()

        HTTPRequestDuration.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
        ).Observe(duration)
    }
}
```

### 前端監控指標

#### React 性能監控
```typescript
// metrics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class MetricsCollector {
  private endpoint = '/api/v1/metrics/frontend';

  constructor() {
    this.initWebVitals();
    this.initCustomMetrics();
  }

  private initWebVitals() {
    // Core Web Vitals
    getCLS(this.sendMetric.bind(this));  // Cumulative Layout Shift
    getFID(this.sendMetric.bind(this));  // First Input Delay
    getFCP(this.sendMetric.bind(this));  // First Contentful Paint
    getLCP(this.sendMetric.bind(this));  // Largest Contentful Paint
    getTTFB(this.sendMetric.bind(this)); // Time to First Byte
  }

  private initCustomMetrics() {
    // 頁面加載時間
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.sendCustomMetric('page_load_time', loadTime);
    });

    // React 組件渲染時間
    this.measureComponentRender();

    // API 請求監控
    this.interceptAPIRequests();
  }

  private sendMetric(metric: any) {
    const data = {
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
}
```

## 📝 日誌管理 (Logs)

### Grafana Loki 配置

#### Loki 服務配置
```yaml
# loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

# 限制配置
limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  ingestion_rate_mb: 16
  ingestion_burst_size_mb: 32
  max_streams_per_user: 10000
  max_line_size: 256000
```

### 結構化日誌實現

#### Go 後端結構化日誌
```go
// logger.go
package logger

import (
    "context"
    "github.com/sirupsen/logrus"
    "go.opentelemetry.io/otel/trace"
)

type Logger struct {
    *logrus.Logger
}

func NewLogger(level string) *Logger {
    log := logrus.New()
    log.SetFormatter(&logrus.JSONFormatter{
        TimestampFormat: "2006-01-02T15:04:05.000Z07:00",
    })

    if parsedLevel, err := logrus.ParseLevel(level); err == nil {
        log.SetLevel(parsedLevel)
    }

    return &Logger{log}
}

func (l *Logger) WithContext(ctx context.Context) *logrus.Entry {
    entry := l.WithFields(logrus.Fields{})

    // 添加追蹤信息
    if span := trace.SpanFromContext(ctx); span.SpanContext().IsValid() {
        spanCtx := span.SpanContext()
        entry = entry.WithFields(logrus.Fields{
            "trace_id": spanCtx.TraceID().String(),
            "span_id":  spanCtx.SpanID().String(),
        })
    }

    return entry
}

// 業務日誌方法
func (l *Logger) LogEvent(ctx context.Context, eventType string, data map[string]interface{}) {
    l.WithContext(ctx).WithFields(logrus.Fields{
        "event_type": eventType,
        "data":       data,
        "component":  "event_processor",
    }).Info("Event processed")
}

func (l *Logger) LogError(ctx context.Context, err error, component string, data map[string]interface{}) {
    l.WithContext(ctx).WithFields(logrus.Fields{
        "error":     err.Error(),
        "component": component,
        "data":      data,
    }).Error("Error occurred")
}
```

#### Promtail 日誌收集配置
```yaml
# promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # SRE 平台後端日誌
  - job_name: sre-platform-backend
    static_configs:
      - targets:
          - localhost
        labels:
          job: sre-platform-backend
          environment: production
          __path__: /var/log/sre-platform/backend/*.log

    # 日誌解析
    pipeline_stages:
      # JSON 解析
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            component: component
            trace_id: trace_id

      # 時間戳解析
      - timestamp:
          source: timestamp
          format: "2006-01-02T15:04:05.000Z07:00"

      # 標籤提取
      - labels:
          level: level
          component: component

  # Kubernetes 容器日誌
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels:
          - __meta_kubernetes_pod_controller_name
        regex: ([0-9a-z-.]+?)(-[0-9a-f]{8,10})?
        action: replace
        target_label: __tmp_controller_name

      - source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_name
          - __meta_kubernetes_pod_label_app
          - __tmp_controller_name
          - __meta_kubernetes_pod_name
        regex: ^;*([^;]+)(;.*)?$
        action: replace
        target_label: app

      - source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_component
          - __meta_kubernetes_pod_label_component
        regex: ^;*([^;]+)(;.*)?$
        action: replace
        target_label: component
```

### 日誌查詢和分析

#### LogQL 查詢示例
```logql
# 基礎日誌查詢
{job="sre-platform-backend"} |= "error"

# 按時間範圍和級別過濾
{job="sre-platform-backend", level="error"} | json | timestamp > 1h

# 統計錯誤率
rate(({job="sre-platform-backend"} |= "error")[5m])

# 按組件分組統計
sum by (component) (rate(({job="sre-platform-backend", level="error"})[5m]))

# 追蹤 ID 相關日誌
{job="sre-platform-backend"} | json | trace_id="abc123def456"

# 複雜過濾和聚合
{job="sre-platform-backend"}
  | json
  | component="event_processor"
  | event_type="alert"
  | line_format "{{.timestamp}} [{{.level}}] {{.message}}"
```

## 🔗 分散式追蹤 (Traces)

### OpenTelemetry 配置

#### Go SDK 配置
```go
// tracing.go
package tracing

import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.20.0"
    "go.opentelemetry.io/otel/trace"
)

func InitTracing(serviceName, jaegerEndpoint string) (func(), error) {
    // Jaeger exporter
    exp, err := jaeger.New(jaeger.WithCollectorEndpoint(
        jaeger.WithEndpoint(jaegerEndpoint),
    ))
    if err != nil {
        return nil, err
    }

    // Resource 信息
    r, err := resource.Merge(
        resource.Default(),
        resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String(serviceName),
            semconv.ServiceVersionKey.String("v1.0.0"),
            attribute.String("environment", "production"),
        ),
    )
    if err != nil {
        return nil, err
    }

    // Tracer provider
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exp),
        sdktrace.WithResource(r),
        sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.1)), // 10% 採樣
    )

    otel.SetTracerProvider(tp)

    return func() {
        tp.Shutdown(context.Background())
    }, nil
}

// 追蹤中間件
func TracingMiddleware(serviceName string) gin.HandlerFunc {
    tracer := otel.Tracer(serviceName)

    return func(c *gin.Context) {
        ctx, span := tracer.Start(c.Request.Context(), c.FullPath(),
            trace.WithAttributes(
                semconv.HTTPMethodKey.String(c.Request.Method),
                semconv.HTTPURLKey.String(c.Request.URL.String()),
                semconv.UserAgentOriginalKey.String(c.Request.UserAgent()),
            ),
        )
        defer span.End()

        c.Request = c.Request.WithContext(ctx)
        c.Next()

        // 設置響應屬性
        span.SetAttributes(
            semconv.HTTPStatusCodeKey.Int(c.Writer.Status()),
            semconv.HTTPResponseSizeKey.Int(c.Writer.Size()),
        )

        if c.Writer.Status() >= 400 {
            span.SetStatus(codes.Error, "HTTP Error")
        }
    }
}
```

#### 業務邏輯追蹤
```go
// business_tracing.go
func ProcessEvent(ctx context.Context, event *Event) error {
    tracer := otel.Tracer("sre-platform/event-processor")

    ctx, span := tracer.Start(ctx, "ProcessEvent",
        trace.WithAttributes(
            attribute.String("event.type", event.Type),
            attribute.String("event.id", event.ID),
            attribute.String("event.severity", event.Severity),
        ),
    )
    defer span.End()

    // 子 Span - 數據驗證
    if err := validateEvent(ctx, event); err != nil {
        span.SetStatus(codes.Error, "Validation failed")
        span.RecordError(err)
        return err
    }

    // 子 Span - 業務處理
    if err := processBusinessLogic(ctx, event); err != nil {
        span.SetStatus(codes.Error, "Processing failed")
        span.RecordError(err)
        return err
    }

    // 子 Span - 通知發送
    if err := sendNotifications(ctx, event); err != nil {
        span.SetStatus(codes.Warning, "Notification failed")
        span.RecordError(err)
        // 不返回錯誤，允許繼續處理
    }

    span.SetAttributes(attribute.Bool("event.processed", true))
    return nil
}

func validateEvent(ctx context.Context, event *Event) error {
    _, span := otel.Tracer("sre-platform/validator").Start(ctx, "ValidateEvent")
    defer span.End()

    // 驗證邏輯
    if event.Type == "" {
        span.SetStatus(codes.Error, "Missing event type")
        return errors.New("event type is required")
    }

    span.SetAttributes(attribute.Bool("validation.passed", true))
    return nil
}
```

## 🚨 告警管理 (Alerting)

### AlertManager 配置

#### 基礎告警配置
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.company.com:587'
  smtp_from: 'alerts@company.com'
  smtp_auth_username: 'alerts@company.com'
  smtp_auth_password: '${SMTP_PASSWORD}'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'web.hook'
  routes:
    # 嚴重告警路由
    - match:
        severity: critical
      receiver: 'critical-alerts'
      group_wait: 10s
      repeat_interval: 5m

    # 資料庫告警路由
    - match:
        component: database
      receiver: 'database-team'

    # SRE 平台告警路由
    - match:
        job: sre-platform-backend
      receiver: 'sre-platform-team'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://sre-platform:8080/api/v1/webhooks/alerts'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@company.com'
        subject: '🚨 Critical Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}

    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#critical-alerts'
        title: 'Critical Alert'
        text: |
          {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Severity:* {{ .Labels.severity }}
          {{ end }}

  - name: 'sre-platform-team'
    email_configs:
      - to: 'sre-platform-team@company.com'
        subject: 'SRE Platform Alert: {{ .GroupLabels.alertname }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

### 告警規則定義

#### Prometheus 告警規則
```yaml
# alert_rules.yml
groups:
  - name: sre-platform.rules
    rules:
      # 高級別告警規則
      - alert: SREPlatformDown
        expr: up{job="sre-platform-backend"} == 0
        for: 1m
        labels:
          severity: critical
          component: sre-platform
        annotations:
          summary: "SRE Platform backend is down"
          description: "SRE Platform backend has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: |
          (
            sum(rate(sre_platform_http_requests_total{status_code=~"5.."}[5m])) /
            sum(rate(sre_platform_http_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: critical
          component: sre-platform
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for 5 minutes"

      # 性能告警規則
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(sre_platform_http_request_duration_seconds_bucket[5m])) by (le)
          ) > 0.5
        for: 10m
        labels:
          severity: warning
          component: sre-platform
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: DatabaseConnectionIssues
        expr: sre_platform_database_connections{state="idle"} < 5
        for: 5m
        labels:
          severity: warning
          component: database
        annotations:
          summary: "Low database connection pool"
          description: "Only {{ $value }} idle database connections available"

      # 資源使用告警
      - alert: HighCPUUsage
        expr: |
          (
            sum(rate(container_cpu_usage_seconds_total{container="sre-platform-backend"}[5m])) by (instance) /
            sum(container_spec_cpu_quota{container="sre-platform-backend"}) by (instance) *
            100
          ) > 80
        for: 10m
        labels:
          severity: warning
          component: sre-platform
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"

      - alert: HighMemoryUsage
        expr: |
          (
            container_memory_usage_bytes{container="sre-platform-backend"} /
            container_spec_memory_limit_bytes{container="sre-platform-backend"} *
            100
          ) > 85
        for: 5m
        labels:
          severity: warning
          component: sre-platform
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"
```

### 智能告警處理

#### 告警 Webhook 處理
```go
// alert_webhook.go
type AlertWebhookHandler struct {
    logger    *logger.Logger
    processor *AlertProcessor
    notifier  *NotificationService
}

type PrometheusAlert struct {
    Status       string            `json:"status"`
    Labels       map[string]string `json:"labels"`
    Annotations  map[string]string `json:"annotations"`
    StartsAt     time.Time         `json:"startsAt"`
    EndsAt       time.Time         `json:"endsAt"`
    GeneratorURL string            `json:"generatorURL"`
}

type AlertManagerPayload struct {
    Version           string             `json:"version"`
    GroupKey          string             `json:"groupKey"`
    Status            string             `json:"status"`
    Receiver          string             `json:"receiver"`
    GroupLabels       map[string]string  `json:"groupLabels"`
    CommonLabels      map[string]string  `json:"commonLabels"`
    CommonAnnotations map[string]string  `json:"commonAnnotations"`
    ExternalURL       string             `json:"externalURL"`
    Alerts            []PrometheusAlert  `json:"alerts"`
}

func (h *AlertWebhookHandler) HandleAlert(c *gin.Context) {
    var payload AlertManagerPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        h.logger.LogError(c.Request.Context(), err, "alert_webhook",
            map[string]interface{}{"error": "Invalid payload"})
        c.JSON(400, gin.H{"error": "Invalid payload"})
        return
    }

    ctx := c.Request.Context()

    // 處理每個告警
    for _, alert := range payload.Alerts {
        if err := h.processAlert(ctx, &alert, &payload); err != nil {
            h.logger.LogError(ctx, err, "alert_processor",
                map[string]interface{}{
                    "alert_name": alert.Labels["alertname"],
                    "severity": alert.Labels["severity"],
                })
        }
    }

    c.JSON(200, gin.H{"status": "received"})
}

func (h *AlertWebhookHandler) processAlert(ctx context.Context, alert *PrometheusAlert, payload *AlertManagerPayload) error {
    // 創建內部告警事件
    event := &Event{
        Type:        "alert",
        Severity:    alert.Labels["severity"],
        Source:      "prometheus",
        Title:       alert.Annotations["summary"],
        Description: alert.Annotations["description"],
        Labels:      alert.Labels,
        Metadata: map[string]interface{}{
            "prometheus_alert": alert,
            "group_key":       payload.GroupKey,
            "generator_url":   alert.GeneratorURL,
        },
        CreatedAt: alert.StartsAt,
    }

    // AI 分析告警
    if analysis, err := h.processor.AnalyzeAlert(ctx, event); err == nil {
        event.AIAnalysis = analysis
    }

    // 儲存告警事件
    if err := h.processor.SaveEvent(ctx, event); err != nil {
        return err
    }

    // 智能路由通知
    return h.notifier.RouteNotification(ctx, event)
}
```

## 📈 可視化儀表板

### Grafana 儀表板配置

#### SRE 平台概覽儀表板
```json
{
  "dashboard": {
    "title": "SRE Platform Overview",
    "tags": ["sre-platform", "overview"],
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"sre-platform-backend\"}",
            "legendFormat": "Backend Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "green", "value": 1}
              ]
            }
          }
        }
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(sre_platform_http_requests_total[5m])) by (endpoint)",
            "legendFormat": "{{endpoint}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(sre_platform_http_requests_total{status_code=~\"5..\"}[5m])) / sum(rate(sre_platform_http_requests_total[5m]))",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Response Time P95",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(sre_platform_http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "P95 Response Time"
          }
        ]
      }
    ]
  }
}
```

#### 自定義監控面板
```typescript
// CustomDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert } from 'antd';
import { Line, Column } from '@ant-design/plots';

interface SystemMetrics {
  uptime: number;
  requestRate: number;
  errorRate: number;
  responseTime: number;
  activeUsers: number;
}

const CustomDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    requestRate: 1250,
    errorRate: 0.02,
    responseTime: 145,
    activeUsers: 234,
  });

  const [alertsData, setAlertsData] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/v1/metrics/dashboard');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30秒更新
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="系統可用性"
              value={metrics.uptime}
              precision={2}
              suffix="%"
              valueStyle={{ color: metrics.uptime > 99.5 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="請求速率"
              value={metrics.requestRate}
              suffix="req/min"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="錯誤率"
              value={metrics.errorRate}
              precision={3}
              suffix="%"
              valueStyle={{ color: metrics.errorRate > 0.1 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="響應時間 P95"
              value={metrics.responseTime}
              suffix="ms"
              valueStyle={{ color: metrics.responseTime > 500 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="實時請求統計">
            <RequestRateChart />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="錯誤趨勢">
            <ErrorTrendChart />
          </Card>
        </Col>
      </Row>

      {alertsData.length > 0 && (
        <Card title="活動告警" style={{ marginTop: '24px' }}>
          {alertsData.map((alert, index) => (
            <Alert
              key={index}
              message={alert.title}
              description={alert.description}
              type={alert.severity === 'critical' ? 'error' : 'warning'}
              showIcon
              style={{ marginBottom: '8px' }}
            />
          ))}
        </Card>
      )}
    </div>
  );
};
```

## 📱 移動端監控

### React Native 監控應用
```typescript
// MobileMonitoringApp.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from './screens/DashboardScreen';
import AlertsScreen from './screens/AlertsScreen';
import SystemHealthScreen from './screens/SystemHealthScreen';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'SRE 監控中心' }}
        />
        <Stack.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{ title: '告警列表' }}
        />
        <Stack.Screen
          name="SystemHealth"
          component={SystemHealthScreen}
          options={{ title: '系統健康狀態' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## 📋 監控檢查清單

### 基礎設施監控檢查
- [ ] 服務器 CPU、內存、磁盤監控
- [ ] 網絡流量和連接監控
- [ ] 容器資源使用監控
- [ ] 資料庫性能監控
- [ ] 快取系統監控

### 應用性能監控檢查
- [ ] API 響應時間監控
- [ ] 錯誤率監控
- [ ] 吞吐量監控
- [ ] 用戶會話監控
- [ ] 業務指標監控

### 告警配置檢查
- [ ] 告警規則定義完整
- [ ] 告警閾值設置合理
- [ ] 通知渠道配置正確
- [ ] 告警升級機制建立
- [ ] 告警抑制規則設置

### 可視化配置檢查
- [ ] 核心儀表板創建
- [ ] 關鍵指標圖表配置
- [ ] 移動端監控支持
- [ ] 自定義視圖配置
- [ ] 數據導出功能

## 📋 總結

SRE 平台監控與告警指南提供了完整的可觀測性解決方案，涵蓋了指標收集、日誌管理、分散式追蹤、告警管理和可視化展示等各個方面。

### 關鍵特性
1. **全棧可觀測性**: 基礎設施到應用層的完整監控
2. **智能告警**: AI 驅動的告警分析和處理
3. **多維度可視化**: Web、移動端多平台支持
4. **自動化運維**: 自動化監控配置和告警響應
5. **可擴展架構**: 支持大規模分散式系統監控

### 最佳實踐建議
- **監控即代碼**: 將監控配置納入版本控制
- **SLO 驅動**: 基於 SLO/SLI 設計告警規則
- **降噪優先**: 減少告警噪音，提高告警質量
- **自動化響應**: 建立自動化告警響應機制
- **持續優化**: 定期評估和優化監控策略