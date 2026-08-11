import { LucideIcon } from "lucide-react";

export interface ReportCardData {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
  period: string;
  buttonText: string;
  buttonColor: string;
}

export interface DeliveryOption {
  title: string;
  description: string;
  enabled: boolean;
}

export interface ReportHistoryItem {
  name: string;
  timestamp: string;
  period: string;
  status: string;
}