import { Cow } from "../types/cow";

export const cows: Cow[] = [
  {
    id: "#742-ALPHA",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
    lactation: "2nd",
    status: "CRITICAL",

    metrics: [
      { label: "PROD", value: 85, color: "bg-green-600" },
      { label: "HLTH", value: 30, color: "bg-red-500" },
      { label: "STAB", value: 60, color: "bg-green-400" },
      { label: "STRS", value: 95, color: "bg-red-500" },
    ],

    prediction1: {
      icon: "📉",
      title: "YIELD",
      value: "-12% Forecast",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
    },

    prediction2: {
      icon: "⚠️",
      title: "RISK",
      value: "Acute Mastitis",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },

    production: 85,
    healthScore: 30,
    stability: 60,
    stress: 95,
  },

  {
    id: "#819-BETA",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
    lactation: "1st",
    status: "HEALTHY",

    metrics: [
      { label: "PROD", value: 90, color: "bg-green-600" },
      { label: "HLTH", value: 95, color: "bg-green-500" },
      { label: "STAB", value: 88, color: "bg-green-500" },
      { label: "STRS", value: 15, color: "bg-green-600" },
    ],

    prediction1: {
      icon: "🥛",
      title: "MILK",
      value: "32.4 kg/d",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
    },

    prediction2: {
      icon: "✨",
      title: "PREDICT",
      value: "Peak Yield",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
    },

    production: 90,
    healthScore: 95,
    stability: 88,
    stress: 15,
    milkYield: 32.4,
  },

  {
    id: "#112-GAMMA",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
    lactation: "3rd",
    status: "WARNING",

    metrics: [
      { label: "PROD", value: 70, color: "bg-green-600" },
      { label: "HLTH", value: 55, color: "bg-yellow-500" },
      { label: "STAB", value: 40, color: "bg-green-400" },
      { label: "STRS", value: 80, color: "bg-yellow-500" },
    ],

    prediction1: {
      icon: "🌡️",
      title: "THI",
      value: "74 Index",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },

    prediction2: {
      icon: "⏱️",
      title: "ALERT",
      value: "Rest Cycle Low",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
    },

    production: 70,
    healthScore: 55,
    stability: 40,
    stress: 80,
    thi: 74,
  },

  {
    id: "#902-DELTA",
    image: "",
    lactation: "4th",
    status: "STABLE",

    metrics: [],

    prediction1: {
      icon: "",
      title: "",
      value: "",
      bgColor: "",
      textColor: "",
    },

    prediction2: {
      icon: "",
      title: "",
      value: "",
      bgColor: "",
      textColor: "",
    },

    production: 60,
    healthScore: 60,
    stability: 60,
    stress: 60,
  },

  {
    id: "#105-EPSILON",
    image: "",
    lactation: "2nd",
    status: "HEALTHY",

    metrics: [],

    prediction1: {
      icon: "",
      title: "",
      value: "",
      bgColor: "",
      textColor: "",
    },

    prediction2: {
      icon: "",
      title: "",
      value: "",
      bgColor: "",
      textColor: "",
    },

    production: 75,
    healthScore: 75,
    stability: 75,
    stress: 25,
  },
];