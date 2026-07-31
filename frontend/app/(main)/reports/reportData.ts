import {
  ClipboardList,
  BriefcaseMedical,
  TrendingUp,
} from "lucide-react";

import {
  ReportCard,
  DeliveryItem,
  HistoryItem,
} from "./types/report";

export const reportCards: ReportCard[] = [
  {
    id: 1,
    title: "Daily Herd Summary",
    description:
      "Comprehensive snapshot of metabolic rates, movement patterns, and feeding efficiency for all 1,200 head.",
    period: "24H CYCLE",
    icon: ClipboardList,
    iconBg: "bg-green-100",
    buttonColor: "bg-[#006B4F]",
  },

  {
    id: 2,
    title: "Weekly Vet Digest",
    description:
      "Aggregated health alerts, medication logs, and predicted vet visits for the upcoming week based on thermal trends.",
    period: "7D WINDOW",
    icon: BriefcaseMedical,
    iconBg: "bg-blue-100",
    buttonColor: "bg-[#005EA8]",
  },

  {
    id: 3,
    title: "Monthly Productivity",
    description:
      "Deep-dive into yield forecasts, feed conversion ratios, and long-term sustainability metrics with AI extrapolation.",
    period: "30D TREND",
    icon: TrendingUp,
    iconBg: "bg-purple-100",
    buttonColor: "bg-[#6251B5]",
  },
];

export const deliveryItems: DeliveryItem[] = [
  {
    id: 1,
    title: "Daily Email",
    subtitle: "06:00 AM Delivery",
    enabled: true,
  },

  {
    id: 2,
    title: "Weekly Vet Digest",
    subtitle: "Monday Mornings",
    enabled: false,
  },

  {
    id: 3,
    title: "Sensor Health Map",
    subtitle: "Real-time alerts",
    enabled: true,
  },
];

export const historyItems: HistoryItem[] = [
  {
    id: 1,
    type: "normal",
    reportName: "Daily_Herd_Summary_240523",
    timestamp: "Today, 06:00 AM",
    dataPeriod: "May 22 - May 23",
    status: "Completed",
  },

  {
    id: 2,
    type: "normal",
    reportName: "Weekly_Vet_Digest_W20",
    timestamp: "May 20, 08:30 AM",
    dataPeriod: "May 13 - May 19",
    status: "Completed",
  },

  {
    id: 3,
    type: "normal",
    reportName: "Monthly_Productivity_Apr24",
    timestamp: "May 01, 12:00 AM",
    dataPeriod: "April 01 - April 30",
    status: "Archived",
  },

  {
    id: 4,
    type: "warning",
    reportName: "Anomaly_Report_Mastitis_V4",
    timestamp: "Apr 28, 14:15 PM",
    dataPeriod: "Apr 28 - Apr 28",
    status: "Critical",
  },

  {
    id: 5,
    type: "normal",
    reportName: "Feed_Inventory_Q1",
    timestamp: "Apr 05, 09:00 AM",
    dataPeriod: "Jan 01 - Mar 31",
    status: "Legacy",
  },
];