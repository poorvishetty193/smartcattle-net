import {
  ClipboardList,
  BriefcaseMedical,
  TrendingUp,
} from "lucide-react";

export const reportCards = [
  {
    icon: ClipboardList,
    iconBg: "bg-[#B9F5DC]",
    title: "Daily Herd Summary",
    description:
      "Comprehensive snapshot of metabolic rates, movement patterns, and feeding efficiency for all 1,200 head.",
    period: "24H CYCLE",
    buttonText: "Generate",
    buttonColor: "bg-[#007D5D]",
  },
  {
    icon: BriefcaseMedical,
    iconBg: "bg-[#C8DEFA]",
    title: "Weekly Vet Digest",
    description:
      "Aggregated health alerts, medication logs, and predicted vet visits for the upcoming week based on thermal trends.",
    period: "7D WINDOW",
    buttonText: "Generate",
    buttonColor: "bg-[#0872B9]",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-[#E9D9FF]",
    title: "Monthly Productivity",
    description:
      "Deep-dive into yield forecasts, feed conversion ratios, and long-term sustainability metrics with AI extrapolation.",
    period: "30D TREND",
    buttonText: "Generate",
    buttonColor: "bg-[#5B4DB7]",
  },
];


export const deliveryOptions = [
  {
    title: "Daily Email",
    description: "06:00 AM Delivery",
    enabled: true,
  },
  {
    title: "Weekly Vet Digest",
    description: "Monday Mornings",
    enabled: false,
  },
  {
    title: "Sensor Health Map",
    description: "Real-time alerts",
    enabled: true,
  },
];


export const reportHistory = [
  {
    name: "Daily_Herd_Summary_240523",
    timestamp: "Today, 06:00 AM",
    period: "May 22 - May 23",
    status: "Completed",
  },
  {
    name: "Weekly_Vet_Digest_W20",
    timestamp: "May 20, 08:30 AM",
    period: "May 13 - May 19",
    status: "Completed",
  },
  {
    name: "Monthly_Productivity_Apr24",
    timestamp: "May 01, 12:00 AM",
    period: "April 01 - April 30",
    status: "Archived",
  },
  {
    name: "Anomaly_Report_Mastitis_V4",
    timestamp: "Apr 28, 14:15 PM",
    period: "Apr 28 - Apr 28",
    status: "Critical",
  },
  {
    name: "Feed_Inventory_Q1",
    timestamp: "Apr 05, 09:00 AM",
    period: "Jan 01 - Mar 31",
    status: "Legacy",
  },
];