import { apiClient } from "@/lib/api/client";
import type { MonitorItem, MonitorCheckHistoryItem } from "./types";

export interface MonitorListParams {
  [key: string]: string | number | boolean | undefined | null;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface MonitorDetailData extends MonitorItem {
  checks?: MonitorCheckHistoryItem[];
  uptimePercentage?: number;
  avgLatencyMs?: number;
  p95LatencyMs?: number;
}

export interface CreateMonitorPayload {
  name: string;
  url: string;
  method?: string;
  intervalSeconds?: number;
  timeoutMs?: number;
  expectedStatusCodes?: number[];
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  expectedHeaders?: Record<string, string>;
  bodyValidation?: {
    type: "contains" | "equals" | "json_path";
    target?: string;
    expectedValue?: string;
  };
}

export const monitorApi = {
  list: async (params?: MonitorListParams) => {
    const res = await apiClient.get<MonitorItem[]>("/api/monitors", params);
    return {
      monitors: res.data || [],
      pagination: res.meta,
    };
  },

  getById: async (id: string) => {
    const res = await apiClient.get<MonitorDetailData>(`/api/monitors/${id}`);
    return res.data;
  },

  create: async (payload: CreateMonitorPayload) => {
    const res = await apiClient.post<MonitorItem>("/api/monitors", payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateMonitorPayload>) => {
    const res = await apiClient.patch<MonitorItem>(`/api/monitors/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ id: string; deleted: boolean }>(
      `/api/monitors/${id}`
    );
    return res.data;
  },

  pause: async (id: string) => {
    const res = await apiClient.post<MonitorItem>(`/api/monitors/${id}/pause`);
    return res.data;
  },

  resume: async (id: string) => {
    const res = await apiClient.post<MonitorItem>(`/api/monitors/${id}/resume`);
    return res.data;
  },

  checkNow: async (id: string) => {
    const res = await apiClient.post<MonitorCheckHistoryItem>(
      `/api/monitors/${id}/check-now`
    );
    return res.data;
  },

  getExportUrl: (id: string) => `/api/monitors/${id}/export`,

  getChecks: async (id: string, page = 1, limit = 20) => {
    const res = await apiClient.get<MonitorCheckHistoryItem[]>(
      `/api/monitors/${id}/checks`,
      { page, limit }
    );
    return {
      checks: res.data || [],
      pagination: res.meta,
    };
  },
};
