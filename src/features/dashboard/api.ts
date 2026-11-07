import { apiClient } from "@/lib/api/client";

export interface DashboardSummaryData {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  overallUptime: number;
  avgResponseTimeMs: number;
  activeIncidentsCount: number;
  activeIncidents: Array<{
    id: string;
    name: string;
    url: string;
    lastCheckedAt: string | null;
  }>;
}

export const dashboardApi = {
  getSummary: async () => {
    const res = await apiClient.get<DashboardSummaryData>(
      "/api/dashboard/summary"
    );
    return res.data;
  },
};
