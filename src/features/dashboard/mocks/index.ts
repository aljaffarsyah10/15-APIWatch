// ============================================================================
// FRONTEND_MOCK_DASHBOARD_DATA
// Notice: Isolated mock data strictly for Phase 5 frontend presentation.
// Will be replaced by real Route Handlers and PostgreSQL data in Phase 7.
// ============================================================================

import type { DashboardSummary, IncidentEvent, ChartDataPoint } from "../types";

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  totalMonitors: 12,
  upMonitors: 11,
  downMonitors: 1,
  pausedMonitors: 0,
  avgResponseTimeMs: 142,
  uptimePercentage: 99.85,
};

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { time: "00:00", latency: 120, expectedMax: 500 },
  { time: "02:00", latency: 135, expectedMax: 500 },
  { time: "04:00", latency: 110, expectedMax: 500 },
  { time: "06:00", latency: 145, expectedMax: 500 },
  { time: "08:00", latency: 180, expectedMax: 500 },
  { time: "10:00", latency: 210, expectedMax: 500 },
  { time: "12:00", latency: 195, expectedMax: 500 },
  { time: "14:00", latency: 160, expectedMax: 500 },
  { time: "16:00", latency: 175, expectedMax: 500 },
  { time: "18:00", latency: 140, expectedMax: 500 },
  { time: "20:00", latency: 130, expectedMax: 500 },
  { time: "22:00", latency: 142, expectedMax: 500 },
];

export const MOCK_INCIDENTS: IncidentEvent[] = [
  {
    id: "inc-1",
    monitorId: "mon-2",
    monitorName: "Stripe Webhook Listener",
    eventType: "DOWN",
    message: "HTTP check timed out after 10000ms",
    timestamp: "2 minutes ago",
  },
  {
    id: "inc-2",
    monitorId: "mon-3",
    monitorName: "Elasticsearch Cluster Status",
    eventType: "RECOVERY",
    message: "Endpoint recovered, HTTP 200 OK received",
    timestamp: "3 hours ago",
  },
  {
    id: "inc-3",
    monitorId: "mon-1",
    monitorName: "Auth Microservice",
    eventType: "RECOVERY",
    message: "Healthy response time restored (84ms)",
    timestamp: "1 day ago",
  },
];
