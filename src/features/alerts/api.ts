import { apiClient } from "@/lib/api/client";
import type { AlertChannelItem, AlertChannelType } from "./types";

export interface CreateAlertPayload {
  type: AlertChannelType;
  destination: string;
  secret?: string;
  isEnabled?: boolean;
}

export interface UpdateAlertPayload {
  destination?: string;
  secret?: string;
  isEnabled?: boolean;
}

export const alertApi = {
  list: async () => {
    const res = await apiClient.get<AlertChannelItem[]>("/api/alerts");
    return res.data || [];
  },

  create: async (payload: CreateAlertPayload) => {
    const res = await apiClient.post<AlertChannelItem>("/api/alerts", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateAlertPayload) => {
    const res = await apiClient.patch<AlertChannelItem>(
      `/api/alerts/${id}`,
      payload
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ id: string; deleted: boolean }>(
      `/api/alerts/${id}`
    );
    return res.data;
  },
};
