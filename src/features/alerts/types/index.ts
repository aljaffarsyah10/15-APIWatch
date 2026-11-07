export type AlertChannelType = "EMAIL" | "WEBHOOK";

export interface AlertChannelItem {
  id: string;
  type: AlertChannelType;
  name: string;
  destination: string;
  secretMasked?: string;
  isEnabled: boolean;
  deliveredEventsCount: number;
  lastDeliveredAt?: string;
}
