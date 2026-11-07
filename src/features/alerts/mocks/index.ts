// ============================================================================
// FRONTEND_MOCK_ALERTS_DATA
// Notice: Isolated mock data strictly for Phase 5 frontend presentation.
// ============================================================================

import type { AlertChannelItem } from "../types";

export const MOCK_ALERT_CHANNELS: AlertChannelItem[] = [
  {
    id: "chan-1",
    name: "Primary Developer Email",
    type: "EMAIL",
    destination: "developer@apiwatch.dev",
    isEnabled: true,
    deliveredEventsCount: 12,
    lastDeliveredAt: "3 hours ago",
  },
  {
    id: "chan-2",
    name: "Slack Incident Channel",
    type: "WEBHOOK",
    destination: "https://hooks.slack.com/services/T00/B00/X00",
    secretMasked: "whsec_••••••••••••",
    isEnabled: true,
    deliveredEventsCount: 5,
    lastDeliveredAt: "2 days ago",
  },
  {
    id: "chan-3",
    name: "PagerDuty Trigger Hook",
    type: "WEBHOOK",
    destination: "https://events.pagerduty.com/v2/enqueue",
    secretMasked: "pd_••••••••••••",
    isEnabled: false,
    deliveredEventsCount: 0,
  },
];
