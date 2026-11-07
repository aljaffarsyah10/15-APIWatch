import { MonitorStatusType } from "@/components/shared/StatusBadge";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export interface MonitorItem {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatusCodes: number[];
  status: MonitorStatusType;
  lastResponseTimeMs?: number;
  lastCheckedAt?: string;
  uptime24h?: number;
  uptime7d?: number;
  uptime30d?: number;
}

export interface MonitorCheckHistoryItem {
  id: string;
  monitorId: string;
  status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "NETWORK_ERROR" | "VALIDATION_ERROR";
  httpStatus?: number;
  responseTimeMs?: number;
  failureReason?: string;
  checkedAt: string;
}
