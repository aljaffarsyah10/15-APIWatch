export interface DashboardSummary {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  avgResponseTimeMs: number;
  uptimePercentage: number;
}

export interface IncidentEvent {
  id: string;
  monitorId: string;
  monitorName: string;
  eventType: "DOWN" | "RECOVERY";
  message: string;
  timestamp: string;
}

export interface ChartDataPoint {
  time: string;
  latency: number;
  expectedMax: number;
}
