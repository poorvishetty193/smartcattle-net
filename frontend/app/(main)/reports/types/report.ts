import { LucideIcon } from "lucide-react";

export interface ReportCard {
  id: number;
  title: string;
  description: string;
  period: string;
  icon: LucideIcon;
  iconBg: string;
  buttonColor: string;
}

export interface DeliveryItem {
  id: number;
  title: string;
  subtitle: string;
  enabled: boolean;
}

export interface HistoryItem {
  id: number;
  type: "normal" | "warning";
  reportName: string;
  timestamp: string;
  dataPeriod: string;
  status: "Completed" | "Archived" | "Critical" | "Legacy";
}