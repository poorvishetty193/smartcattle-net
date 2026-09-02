"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type NotificationGroup = "critical" | "reports" | "heat";

type Notifications = {
  critical: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  reports: {
    email: boolean;
  };
  heat: {
    push: boolean;
    email: boolean;
    sms: boolean;
    frequency: string;
  };
};

type SettingsResponse = {
  farm: {
    farm_name: string;
    farm_location: string;
    timezone: string;
  };
  thresholds: {
    milk_drop_threshold: number;
    heat_stress_thi: number;
    scc_mastitis_threshold: number;
    priority_score_cutoff: number;
  };
  notifications: {
    critical_push: boolean;
    critical_email: boolean;
    critical_sms: boolean;
    daily_report_email: boolean;
    heat_push: boolean;
    heat_email: boolean;
    heat_sms: boolean;
  };
};

type HistoryItem = {
  cow_id?: string;
  created_at?: string;
  [key: string]: unknown;
};

type SectionId =
  | "overview"
  | "farm-profile"
  | "thresholds"
  | "notifications"
  | "data-export";

type IconName =
  | "farm"
  | "home"
  | "tune"
  | "bell"
  | "database"
  | "logout"
  | "save"
  | "refresh"
  | "download"
  | "chevron"
  | "check"
  | "warning"
  | "thermo"
  | "mail"
  | "message"
  | "activity"
  | "location"
  | "clock"
  | "shield"
  | "info"
  | "sparkles"
  | "checkCircle"
  | "arrowUp"
  | "settings";

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "farm":
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V10l7-5 7 5v11" />
          <path d="M9 21v-6h6v6" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "tune":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <circle cx="9" cy="6" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="11" cy="18" r="2" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 3v18" />
          <path d="M18 3h-3" />
          <path d="M18 21h-3" />
        </svg>
      );

    case "save":
      return (
        <svg {...common}>
          <path d="M5 3h12l3 3v15H4V3h1Z" />
          <path d="M8 3v6h8V3" />
          <path d="M8 21v-7h8v7" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-14.7-4.7L3 9" />
          <path d="M3 4v5h5" />
          <path d="M4 13a8.1 8.1 0 0 0 14.7 4.7L21 15" />
          <path d="M21 20v-5h-5" />
        </svg>
      );

    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M4 21h16" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="m12 3 9 18H3L12 3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "thermo":
      return (
        <svg {...common}>
          <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
          <path d="M12 5v10" />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "message":
      return (
        <svg {...common}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.8-.9L4 20l1.5-3.8A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 19 6v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </svg>
      );

    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
          <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" />
        </svg>
      );

    case "checkCircle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case "arrowUp":
      return (
        <svg {...common}>
          <path d="M12 19V5" />
          <path d="m6 11 6-6 6 6" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.5v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.5h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.5v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      );

    default:
      return null;
  }
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 ${
        checked ? "bg-[#00795b]" : "bg-[#cbd6d0]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[20px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function SectionCard({
  id,
  icon,
  title,
  description,
  action,
  children,
}: {
  id: SectionId;
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-[22px] border border-[#dfe9e3] bg-white shadow-[0_8px_35px_rgba(23,67,48,0.045)]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#edf2ef] px-5 py-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#e8f6f0] text-[#00795b]">
            <Icon name={icon} size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#17221d]">
              {title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#77847d]">
              {description}
            </p>
          </div>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e0e9e4] bg-white p-4 shadow-[0_5px_20px_rgba(25,70,50,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(25,70,50,0.07)]">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf8f3] text-[#00795b]">
          <Icon name={icon} size={18} />
        </div>

        <span className="flex h-2 w-2 rounded-full bg-[#13a477]" />
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#849089]">
        {label}
      </p>

      <p className="mt-1 truncate text-[17px] font-bold tracking-tight text-[#18231e]">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-[#7b8881]">{detail}</p>
    </div>
  );
}

function ThresholdControl({
  title,
  description,
  value,
  displayValue,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
  icon,
  accent = "green",
}: {
  title: string;
  description: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
  icon: IconName;
  accent?: "green" | "amber";
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="group rounded-[18px] border border-[#e6ede9] bg-[#fbfdfc] p-5 transition-all duration-200 hover:border-[#cfe2d9] hover:bg-white">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            accent === "amber"
              ? "bg-[#fff5df] text-[#a86b00]"
              : "bg-[#e9f7f1] text-[#00795b]"
          }`}
        >
          <Icon name={icon} size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1a2520]">{title}</h3>
              <p className="mt-1 max-w-xl text-xs leading-5 text-[#7a8780]">
                {description}
              </p>
            </div>

            <div
              className={`shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold ${
                accent === "amber"
                  ? "bg-[#fff4dc] text-[#9a6500]"
                  : "bg-[#e6f6ef] text-[#007354]"
              }`}
            >
              {displayValue}
            </div>
          </div>

          <div className="mt-5">
            <div className="relative h-2 overflow-hidden rounded-full bg-[#e1e8e4]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#00795b] transition-all duration-150"
                style={{ width: `${percent}%` }}
              />
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="smart-range absolute mt-[-8px] h-4 w-full cursor-pointer opacity-0"
              aria-label={title}
            />

            <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#9aa59f]">
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({
  icon,
  title,
  description,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-[#e3ebe7] bg-[#fbfdfc] p-5 transition-all duration-200 hover:border-[#cfe1d8] hover:bg-white">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf7f2] text-[#00795b]">
          <Icon name={icon} size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1a2520]">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#7b8781]">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [timezone, setTimezone] = useState("CST (UTC -6)");

  const [milkDrop, setMilkDrop] = useState(15);
  const [thi, setThi] = useState(72);
  const [scc, setScc] = useState(200);
  const [priority, setPriority] = useState(85);

  const [notifications, setNotifications] =
    useState<Notifications>({
      critical: {
        push: true,
        email: true,
        sms: true,
      },
      reports: {
        email: true,
      },
      heat: {
        push: true,
        email: true,
        sms: false,
        frequency: "Immediate",
      },
    });

  const [loading, setLoading] = useState(true);
  const [savingFarm, setSavingFarm] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  const [latestCowId, setLatestCowId] = useState<string | null>(null);
  const [lastPredictionRun, setLastPredictionRun] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SectionId>("overview");

  const messageTimer = useRef<number | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token")
    );
  };

  const showMessage = (text: string, duration = 3000) => {
    setMessage(text);
    setMessageVisible(true);

    if (messageTimer.current) {
      window.clearTimeout(messageTimer.current);
    }

    messageTimer.current = window.setTimeout(() => {
      setMessageVisible(false);
    }, duration);
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const enabledNotifications = useMemo(() => {
    return [
      notifications.critical.push,
      notifications.critical.email,
      notifications.critical.sms,
      notifications.reports.email,
      notifications.heat.push,
      notifications.heat.email,
      notifications.heat.sms,
    ].filter(Boolean).length;
  }, [notifications]);

  const farmConfigured = Boolean(
    farmName.trim() || farmLocation.trim(),
  );

  const loadLatestPrediction = async () => {
    const token = getToken();

    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/predict/history?skip=0&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) return;

      const raw = await response.json();

      const data: HistoryItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : [];

      if (!data.length) return;

      const latest = data[0];

      if (latest?.cow_id) {
        setLatestCowId(String(latest.cow_id));
      }

      if (latest?.created_at) {
        const date = new Date(latest.created_at);

        if (!Number.isNaN(date.getTime())) {
          setLastPredictionRun(date.toLocaleString());
        }
      }
    } catch (error) {
      console.error("Latest prediction load error:", error);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        const response = await fetch(`${API_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load settings.");
        }

        const data: SettingsResponse = await response.json();

        setFarmName(data.farm?.farm_name || "");
        setFarmLocation(data.farm?.farm_location || "");
        setTimezone(data.farm?.timezone || "CST (UTC -6)");

        setMilkDrop(
          Number(
            data.thresholds?.milk_drop_threshold ?? 15,
          ),
        );

        setThi(
          Number(
            data.thresholds?.heat_stress_thi ?? 72,
          ),
        );

        const rawScc = Number(
          data.thresholds?.scc_mastitis_threshold ?? 200000,
        );

        setScc(rawScc > 1000 ? rawScc / 1000 : rawScc);

        const rawPriority = Number(
          data.thresholds?.priority_score_cutoff ?? 8.5,
        );

        setPriority(
          rawPriority <= 1
            ? rawPriority * 100
            : rawPriority * 10,
        );

        setNotifications({
          critical: {
            push: Boolean(
              data.notifications?.critical_push,
            ),
            email: Boolean(
              data.notifications?.critical_email,
            ),
            sms: Boolean(
              data.notifications?.critical_sms,
            ),
          },
          reports: {
            email: Boolean(
              data.notifications?.daily_report_email,
            ),
          },
          heat: {
            push: Boolean(
              data.notifications?.heat_push,
            ),
            email: Boolean(
              data.notifications?.heat_email,
            ),
            sms: Boolean(
              data.notifications?.heat_sms,
            ),
            frequency: "Immediate",
          },
        });
      } catch (error) {
        console.error("Settings load error:", error);
        showMessage("Failed to load settings.", 3500);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    loadLatestPrediction();

    return () => {
      if (messageTimer.current) {
        window.clearTimeout(messageTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const sections: SectionId[] = [
      "overview",
      "farm-profile",
      "thresholds",
      "notifications",
      "data-export",
    ];

    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const element = document.getElementById(id);

      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: "-25% 0px -65% 0px",
          threshold: 0,
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [loading]);

  const saveFarmDetails = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    if (!farmName.trim()) {
      showMessage("Please enter your farm name.", 3000);
      return;
    }

    try {
      setSavingFarm(true);

      const response = await fetch(`${API_URL}/settings/farm`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farm_name: farmName.trim(),
          farm_location: farmLocation.trim(),
          timezone,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save farm details.");
      }

      showMessage("Farm profile saved successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Failed to save farm details.", 3500);
    } finally {
      setSavingFarm(false);
    }
  };

  const saveThresholds = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setSavingThresholds(true);

      const response = await fetch(
        `${API_URL}/settings/thresholds`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            milk_drop_threshold: milkDrop,
            heat_stress_thi: thi,
            scc_mastitis_threshold: scc * 1000,
            priority_score_cutoff: priority / 10,
          }),
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save thresholds.");
      }

      showMessage("Model thresholds saved successfully.");
    } catch (error) {
      console.error(error);
      showMessage(
        "Failed to save model thresholds.",
        3500,
      );
    } finally {
      setSavingThresholds(false);
    }
  };

  const resetDefaults = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setResetting(true);

      const response = await fetch(
        `${API_URL}/settings/thresholds/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to reset thresholds.");
      }

      setMilkDrop(15);
      setThi(72);
      setScc(200);
      setPriority(85);

      showMessage("Thresholds reset to default values.");
    } catch (error) {
      console.error(error);
      showMessage("Failed to reset thresholds.", 3500);
    } finally {
      setResetting(false);
    }
  };

  const saveNotifications = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setSavingNotifications(true);

      const response = await fetch(
        `${API_URL}/settings/notifications`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            critical_push: notifications.critical.push,
            critical_email: notifications.critical.email,
            critical_sms: notifications.critical.sms,

            daily_report_email:
              notifications.reports.email,

            heat_push: notifications.heat.push,
            heat_email: notifications.heat.email,
            heat_sms: notifications.heat.sms,
          }),
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to save notification settings.",
        );
      }

      showMessage(
        "Notification preferences saved successfully.",
      );
    } catch (error) {
      console.error(error);
      showMessage(
        "Failed to save notification preferences.",
        3500,
      );
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleExport = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setExporting(true);

      const response = await fetch(
        `${API_URL}/predict/export`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/csv",
          },
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        let errorMessage =
          "Failed to export predictions.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        "smartcattlenet_predictions.csv";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      showMessage(
        "Prediction history exported successfully.",
      );
    } catch (error) {
      console.error(
        "Prediction export error:",
        error,
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "Failed to export prediction history.",
        3500,
      );
    } finally {
      setExporting(false);
    }
  };

  const handleRerun = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setRerunning(true);

      const historyResponse = await fetch(
        `${API_URL}/predict/history?skip=0&limit=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (historyResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!historyResponse.ok) {
        throw new Error(
          "Failed to find the latest prediction.",
        );
      }

      const rawHistory = await historyResponse.json();

      const history: HistoryItem[] =
        Array.isArray(rawHistory)
          ? rawHistory
          : Array.isArray(rawHistory?.items)
            ? rawHistory.items
            : Array.isArray(rawHistory?.data)
              ? rawHistory.data
              : [];

      if (!history.length) {
        showMessage(
          "No previous prediction is available to re-run.",
          3500,
        );
        return;
      }

      const cowId = history[0]?.cow_id;

      if (!cowId) {
        showMessage(
          "The latest prediction does not contain a cow ID.",
          3500,
        );
        return;
      }

      setLatestCowId(String(cowId));

      const rerunResponse = await fetch(
        `${API_URL}/predict/rerun?cow_id=${encodeURIComponent(
          String(cowId),
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (rerunResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!rerunResponse.ok) {
        let errorMessage =
          "Failed to re-run prediction.";

        try {
          const errorData = await rerunResponse.json();

          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(errorMessage);
      }

      const result = await rerunResponse.json();

      if (result?.cow_id) {
        setLatestCowId(String(result.cow_id));
      }

      const now = new Date();
      setLastPredictionRun(now.toLocaleString());

      showMessage(
        `Prediction re-run successfully for ${cowId}.`,
      );
    } catch (error) {
      console.error(
        "Prediction re-run error:",
        error,
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "Failed to re-run prediction.",
        3500,
      );
    } finally {
      setRerunning(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const toggleNotification = (
    group: NotificationGroup,
    field: string,
  ) => {
    setNotifications((prev) => {
      if (group === "critical") {
        const key =
          field as keyof typeof prev.critical;

        return {
          ...prev,
          critical: {
            ...prev.critical,
            [key]: !prev.critical[key],
          },
        };
      }

      if (group === "reports") {
        const key =
          field as keyof typeof prev.reports;

        return {
          ...prev,
          reports: {
            ...prev.reports,
            [key]: !prev.reports[key],
          },
        };
      }

      const key = field as keyof typeof prev.heat;

      if (key === "frequency") {
        return prev;
      }

      return {
        ...prev,
        heat: {
          ...prev.heat,
          [key]: !prev.heat[key],
        },
      };
    });
  };

  const navigation: {
    id: SectionId;
    label: string;
    icon: IconName;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "activity",
    },
    {
      id: "farm-profile",
      label: "Farm profile",
      icon: "home",
    },
    {
      id: "thresholds",
      label: "Model thresholds",
      icon: "tune",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "bell",
    },
    {
      id: "data-export",
      label: "Data & export",
      icon: "database",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f9f6]">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#00795b] text-white shadow-[0_12px_30px_rgba(0,121,91,0.22)]">
            <Icon name="farm" size={29} />
            <span className="absolute inset-0 animate-ping rounded-[20px] border border-[#00795b]/30" />
          </div>

          <p className="mt-5 text-sm font-bold text-[#25322c]">
            Loading settings
          </p>

          <p className="mt-1 text-xs text-[#7a8780]">
            Syncing your farm configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9f6] text-[#17211c]">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .smart-range {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
        }

        .smart-range::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 4px solid #00795b;
          box-shadow: 0 2px 8px rgba(0, 70, 50, 0.2);
        }

        .smart-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 4px solid #00795b;
          box-shadow: 0 2px 8px rgba(0, 70, 50, 0.2);
        }

        ::selection {
          background: #ccecdf;
          color: #173229;
        }
      `}</style>

      {/* Toast */}
      <div
        className={`fixed right-5 top-5 z-[100] w-[calc(100%-40px)] max-w-sm transition-all duration-300 ${
          messageVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-start gap-3 rounded-[18px] border border-[#cfe5da] bg-white p-4 shadow-[0_18px_50px_rgba(20,65,45,0.16)]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5f6ef] text-[#00795b]">
            <Icon name="checkCircle" size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-[#17211c]">
              SmartCattle Net
            </p>

            <p className="mt-0.5 text-xs leading-5 text-[#6e7b74]">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Inner application header */}
      <header className="sticky top-0 z-40 border-b border-[#dfe8e3] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1420px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#00795b] text-white shadow-[0_6px_18px_rgba(0,121,91,0.2)]">
              <Icon name="farm" size={21} />
            </div>

            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-[#17221d]">
                SmartCattle Net
              </h1>

              <p className="text-[11px] text-[#7c8982]">
                Farm intelligence platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-[#dce9e2] bg-[#f6fbf8] px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1ab181] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#12a274]" />
              </span>

              <span className="text-[11px] font-bold text-[#587066]">
                System online
              </span>
            </div>

            <div className="hidden h-7 w-px bg-[#e0e9e4] sm:block" />

            <span className="hidden text-xs font-semibold text-[#65736c] md:block">
              Settings
            </span>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dce7e1] bg-white text-[#66756d] transition-all hover:border-[#bcd5c9] hover:bg-[#edf8f3] hover:text-[#00795b] active:scale-95"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1420px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Mobile navigation */}
        <div className="mb-5 overflow-x-auto lg:hidden">
          <div className="flex min-w-max gap-2 pb-1">
            {navigation.map((item) => {
              const active =
                activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                    active
                      ? "border-[#b9ddce] bg-[#e7f6ef] text-[#007354]"
                      : "border-[#dfe8e3] bg-white text-[#6d7b73]"
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex gap-7">
          {/* Sidebar */}
          <aside className="hidden w-[228px] shrink-0 lg:block">
            <div className="sticky top-[92px]">
              <div className="mb-4 px-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7c8a82]">
                  Configuration
                </p>

                <p className="mt-1 text-xs text-[#829087]">
                  Manage your farm
                </p>
              </div>

              <nav className="rounded-[20px] border border-[#dfe9e3] bg-white p-2 shadow-[0_8px_30px_rgba(25,70,50,0.045)]">
                {navigation.map((item) => {
                  const active =
                    activeSection === item.id;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`group relative mb-1 flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-xs font-bold transition-all ${
                        active
                          ? "bg-[#eaf7f2] text-[#007354]"
                          : "text-[#66756d] hover:bg-[#f2f8f5] hover:text-[#007354]"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 h-5 w-1 rounded-r-full bg-[#00795b]" />
                      )}

                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-[10px] transition ${
                          active
                            ? "bg-white text-[#00795b] shadow-sm"
                            : "bg-[#f4f7f5] text-[#77857d] group-hover:bg-white group-hover:text-[#00795b]"
                        }`}
                      >
                        <Icon name={item.icon} size={16} />
                      </span>

                      <span>{item.label}</span>
                    </a>
                  );
                })}

                <div className="my-2 border-t border-[#edf1ef]" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-xs font-bold text-[#ad3333] transition hover:bg-[#fff4f3]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#fff6f5]">
                    <Icon name="logout" size={16} />
                  </span>

                  Logout
                </button>
              </nav>

              <div className="mt-4 rounded-[18px] border border-[#dfe9e3] bg-[#edf8f3] p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#00795b]">
                    <Icon name="shield" size={15} />
                  </div>

                  <span className="text-[11px] font-extrabold text-[#006b50]">
                    Protected settings
                  </span>
                </div>

                <p className="mt-2 text-[10px] leading-4 text-[#688077]">
                  Changes are saved to your SmartCattle account.
                </p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1">
            {/* Hero */}
            <section
              id="overview"
              className="scroll-mt-28 mb-6"
            >
              <div className="relative overflow-hidden rounded-[24px] border border-[#dce9e2] bg-gradient-to-br from-white via-white to-[#edf8f3] p-5 shadow-[0_10px_35px_rgba(25,70,50,0.045)] sm:p-7"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#dff4ea] blur-3xl" />

                <div className="relative">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e7f6ef] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#007354]">
                        <Icon name="settings" size={13} />
                        Configuration
                      </div>

                      <h2 className="text-[28px] font-black tracking-[-0.04em] text-[#17221d] sm:text-[34px]">
                        Settings
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f7d75]">
                        Control how SmartCattle monitors your herd,
                        calculates risk, and sends important alerts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-[#d8e8e0] bg-white/90 px-3.5 py-2 shadow-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a679] opacity-40" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#12a174]" />
                      </span>

                      <span className="text-xs font-bold text-[#587067]">
                        {latestCowId
                          ? `Latest cow ${latestCowId}`
                          : "Settings synced"}
                      </span>
                    </div>
                  </div>

                  {/* Overview cards */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      icon="home"
                      label="Farm profile"
                      value={
                        farmConfigured
                          ? farmName || "Configured"
                          : "Not configured"
                      }
                      detail={
                        farmLocation ||
                        "Add your farm location"
                      }
                    />

                    <StatCard
                      icon="tune"
                      label="Model controls"
                      value="4 thresholds"
                      detail="Prediction sensitivity"
                    />

                    <StatCard
                      icon="bell"
                      label="Active alerts"
                      value={`${enabledNotifications} / 7`}
                      detail="Notification channels"
                    />

                    <StatCard
                      icon="activity"
                      label="Latest prediction"
                      value={
                        latestCowId || "No runs"
                      }
                      detail={
                        lastPredictionRun ||
                        "No prediction history"
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              {/* Farm profile */}
              <SectionCard
                id="farm-profile"
                icon="home"
                title="Farm profile"
                description="Keep your farm identity and regional settings up to date."
                action={
                  farmConfigured ? (
                    <span className="hidden items-center gap-1.5 rounded-full bg-[#e9f7f1] px-3 py-1.5 text-[10px] font-extrabold text-[#007354] sm:flex">
                      <Icon name="check" size={13} />
                      Configured
                    </span>
                  ) : null
                }
              >
                <div className="p-5 sm:p-7">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#74827a]">
                        Farm name
                      </label>

                      <div className="relative">
                        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84928a]">
                          <Icon name="farm" size={17} />
                        </div>

                        <input
                          value={farmName}
                          onChange={(e) =>
                            setFarmName(
                              e.target.value,
                            )
                          }
                          placeholder="Enter farm name"
                          className="w-full rounded-[13px] border border-[#d5e1db] bg-[#fbfdfc] py-3 pl-11 pr-4 text-sm font-medium text-[#1b2721] outline-none transition-all placeholder:text-[#a1aca6] focus:border-[#00795b] focus:bg-white focus:ring-4 focus:ring-[#00795b]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#74827a]">
                        Farm location
                      </label>

                      <div className="relative">
                        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84928a]">
                          <Icon name="location" size={17} />
                        </div>

                        <input
                          value={farmLocation}
                          onChange={(e) =>
                            setFarmLocation(
                              e.target.value,
                            )
                          }
                          placeholder="City, state or region"
                          className="w-full rounded-[13px] border border-[#d5e1db] bg-[#fbfdfc] py-3 pl-11 pr-4 text-sm font-medium text-[#1b2721] outline-none transition-all placeholder:text-[#a1aca6] focus:border-[#00795b] focus:bg-white focus:ring-4 focus:ring-[#00795b]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#74827a]">
                        Timezone
                      </label>

                      <div className="relative">
                        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84928a]">
                          <Icon name="clock" size={17} />
                        </div>

                        <select
                          value={timezone}
                          onChange={(e) =>
                            setTimezone(
                              e.target.value,
                            )
                          }
                          className="w-full appearance-none rounded-[13px] border border-[#d5e1db] bg-[#fbfdfc] py-3 pl-11 pr-10 text-sm font-medium text-[#1b2721] outline-none transition-all focus:border-[#00795b] focus:bg-white focus:ring-4 focus:ring-[#00795b]/10"
                        >
                          <option>
                            CST (UTC -6)
                          </option>
                          <option>
                            IST (UTC +5:30)
                          </option>
                          <option>
                            EST (UTC -5)
                          </option>
                          <option>
                            PST (UTC -8)
                          </option>
                          <option>
                            GMT (UTC +0)
                          </option>
                        </select>

                        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7b8981]">
                          <Icon name="chevron" size={17} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={saveFarmDetails}
                        disabled={savingFarm}
                        className="flex w-full items-center justify-center gap-2 rounded-[13px] bg-[#00795b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(0,121,91,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#006a50] hover:shadow-[0_10px_25px_rgba(0,121,91,0.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-[180px]"
                      >
                        {savingFarm ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icon name="save" size={17} />
                            Save changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Thresholds */}
              <SectionCard
                id="thresholds"
                icon="tune"
                title="Model thresholds"
                description="Tune when SmartCattle flags potential health and production issues."
                action={
                  <button
                    type="button"
                    onClick={resetDefaults}
                    disabled={resetting}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-extrabold text-[#007354] transition hover:bg-[#edf8f3] disabled:opacity-50"
                  >
                    <Icon name="refresh" size={13} />
                    {resetting
                      ? "Resetting..."
                      : "Reset defaults"}
                  </button>
                }
              >
                <div className="p-5 sm:p-7">
                  <div className="mb-5 flex items-start gap-3 rounded-[15px] border border-[#dceee5] bg-[#f4fbf7] p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#00795b]">
                      <Icon name="sparkles" size={16} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#2a4a3d]">
                        Prediction sensitivity
                      </p>

                      <p className="mt-0.5 text-[11px] leading-5 text-[#70847a]">
                        Lower thresholds generally make the system
                        more sensitive to potential changes.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <ThresholdControl
                      title="Milk drop alert"
                      description="Alert when daily milk yield drops below the configured percentage."
                      value={milkDrop}
                      displayValue={`-${milkDrop}%`}
                      min={5}
                      max={50}
                      step={1}
                      minLabel="5%"
                      maxLabel="50%"
                      onChange={setMilkDrop}
                      icon="activity"
                    />

                    <ThresholdControl
                      title="Heat stress THI"
                      description="Temperature-humidity index threshold used for heat stress detection."
                      value={thi}
                      displayValue={`${thi}`}
                      min={60}
                      max={90}
                      step={1}
                      minLabel="60"
                      maxLabel="90"
                      onChange={setThi}
                      icon="thermo"
                      accent="amber"
                    />

                    <ThresholdControl
                      title="SCC mastitis threshold"
                      description="Somatic cell count threshold used for mastitis-related risk detection."
                      value={scc}
                      displayValue={`${scc}k`}
                      min={50}
                      max={500}
                      step={10}
                      minLabel="50k"
                      maxLabel="500k"
                      onChange={setScc}
                      icon="shield"
                    />

                    <ThresholdControl
                      title="Priority score cutoff"
                      description="Minimum score used when ranking predictions by priority."
                      value={priority}
                      displayValue={`${priority}%`}
                      min={0}
                      max={100}
                      step={1}
                      minLabel="0%"
                      maxLabel="100%"
                      onChange={setPriority}
                      icon="sparkles"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-[#e9efec] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-[#7a8780]">
                      <Icon name="info" size={14} />
                      Values are applied to future predictions.
                    </div>

                    <button
                      type="button"
                      onClick={saveThresholds}
                      disabled={savingThresholds}
                      className="flex items-center justify-center gap-2 rounded-[13px] bg-[#00795b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(0,121,91,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#006a50] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingThresholds ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icon name="save" size={17} />
                          Save thresholds
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* Notifications */}
              <SectionCard
                id="notifications"
                icon="bell"
                title="Notification preferences"
                description="Choose which channels SmartCattle should use for important events."
                action={
                  <span className="rounded-full bg-[#e8f7f1] px-3 py-1.5 text-[10px] font-extrabold text-[#007354]">
                    {enabledNotifications} active
                  </span>
                }
              >
                <div className="p-5 sm:p-7">
                  <div className="grid gap-4">
                    <NotificationCard
                      icon="warning"
                      title="Critical alerts"
                      description="High-priority farm events that need immediate attention."
                    >
                      <div className="flex flex-wrap gap-4 sm:gap-6">
                        <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                          <Toggle
                            checked={
                              notifications.critical.push
                            }
                            onChange={() =>
                              toggleNotification(
                                "critical",
                                "push",
                              )
                            }
                            label="Critical push notifications"
                          />
                          Push
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                          <Toggle
                            checked={
                              notifications.critical.email
                            }
                            onChange={() =>
                              toggleNotification(
                                "critical",
                                "email",
                              )
                            }
                            label="Critical email notifications"
                          />
                          Email
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                          <Toggle
                            checked={
                              notifications.critical.sms
                            }
                            onChange={() =>
                              toggleNotification(
                                "critical",
                                "sms",
                              )
                            }
                            label="Critical SMS notifications"
                          />
                          SMS
                        </label>
                      </div>
                    </NotificationCard>

                    <NotificationCard
                      icon="mail"
                      title="Daily insight reports"
                      description="Receive a daily summary of your farm's monitoring activity."
                    >
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                        <Toggle
                          checked={
                            notifications.reports.email
                          }
                          onChange={() =>
                            toggleNotification(
                              "reports",
                              "email",
                            )
                          }
                          label="Daily email reports"
                        />
                        Email
                      </label>
                    </NotificationCard>

                    <NotificationCard
                      icon="thermo"
                      title="Heat detection"
                      description="Receive notifications when heat stress conditions cross your configured THI threshold."
                    >
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                          <Toggle
                            checked={
                              notifications.heat.push
                            }
                            onChange={() =>
                              toggleNotification(
                                "heat",
                                "push",
                              )
                            }
                            label="Heat push notifications"
                          />
                          Push
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                          <Toggle
                            checked={
                              notifications.heat.email
                            }
                            onChange={() =>
                              toggleNotification(
                                "heat",
                                "email",
                              )
                            }
                            label="Heat email notifications"
                          />
                          Email
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-semibold text-[#64736b]">
                          <Toggle
                            checked={
                              notifications.heat.sms
                            }
                            onChange={() =>
                              toggleNotification(
                                "heat",
                                "sms",
                              )
                            }
                            label="Heat SMS notifications"
                          />
                          SMS
                        </label>

                        <div className="relative">
                          <select
                            value={
                              notifications.heat.frequency
                            }
                            onChange={(e) =>
                              setNotifications((prev) => ({
                                ...prev,
                                heat: {
                                  ...prev.heat,
                                  frequency:
                                    e.target.value,
                                },
                              }))
                            }
                            className="appearance-none rounded-xl border border-[#dbe6e0] bg-white py-2 pl-3 pr-8 text-[11px] font-bold text-[#52645b] outline-none focus:border-[#00795b] focus:ring-4 focus:ring-[#00795b]/10"
                            aria-label="Heat notification frequency"
                          >
                            <option>
                              Immediate
                            </option>
                            <option>
                              Hourly
                            </option>
                            <option>
                              Daily
                            </option>
                          </select>

                          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#7b8981]">
                            <Icon
                              name="chevron"
                              size={14}
                            />
                          </div>
                        </div>
                      </div>
                    </NotificationCard>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-[#e9efec] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-[#7a8780]">
                      <Icon name="info" size={14} />
                      Notification channel preferences are saved securely.
                    </div>

                    <button
                      type="button"
                      onClick={saveNotifications}
                      disabled={savingNotifications}
                      className="flex items-center justify-center gap-2 rounded-[13px] bg-[#00795b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(0,121,91,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#006a50] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingNotifications ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icon name="save" size={17} />
                          Save preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* Data management */}
              <SectionCard
                id="data-export"
                icon="database"
                title="Data management"
                description="Export prediction history or run the latest prediction again."
              >
                <div className="p-5 sm:p-7">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[18px] border border-[#e2ebe6] bg-[#f9fcfa] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#829087]">
                            Prediction history
                          </p>

                          <p className="mt-2 text-lg font-extrabold tracking-tight text-[#1a2721]">
                            CSV export
                          </p>

                          <p className="mt-1 max-w-md text-xs leading-5 text-[#77857d]">
                            Download your prediction history for
                            analysis, reporting, or backup.
                          </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f7f1] text-[#00795b]">
                          <Icon name="download" size={19} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[13px] border border-[#cfe0d7] bg-white px-4 py-3 text-xs font-extrabold text-[#416057] transition hover:border-[#a9cdbd] hover:bg-[#f1f8f4] hover:text-[#007354] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {exporting ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9ab8aa] border-t-[#00795b]" />
                            Preparing export...
                          </>
                        ) : (
                          <>
                            <Icon
                              name="download"
                              size={16}
                            />
                            Export prediction history
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-[18px] border border-[#e2ebe6] bg-[#f9fcfa] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#829087]">
                            Latest prediction
                          </p>

                          <p className="mt-2 text-lg font-extrabold tracking-tight text-[#1a2721]">
                            {latestCowId
                              ? `Cow ${latestCowId}`
                              : "No prediction"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#77857d]">
                            {lastPredictionRun
                              ? `Last run ${lastPredictionRun}`
                              : "Run a prediction to populate history."}
                          </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f7f1] text-[#00795b]">
                          <Icon name="refresh" size={19} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRerun}
                        disabled={rerunning || !latestCowId}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[13px] bg-[#00795b] px-4 py-3 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(0,121,91,0.16)] transition hover:bg-[#006a50] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rerunning ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Re-running...
                          </>
                        ) : (
                          <>
                            <Icon
                              name="refresh"
                              size={16}
                            />
                            Re-run latest prediction
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[16px] border border-[#e4ebe7] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef7f3] text-[#00795b]">
                        <Icon name="shield" size={16} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#34453d]">
                          Your prediction data stays under your account
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-[#7b8781]">
                          Export only when you need a local copy for
                          reporting or analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Danger zone */}
              <section className="overflow-hidden rounded-[22px] border border-[#f0d9d7] bg-white shadow-[0_8px_30px_rgba(80,30,25,0.035)]">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ef] text-[#b23832]">
                      <Icon name="logout" size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-[#42201e]">
                        Sign out
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-[#876d69]">
                        Sign out of your SmartCattle Net account on this device.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-[#e8c9c6] bg-white px-4 py-2.5 text-xs font-extrabold text-[#a53631] transition hover:bg-[#fff5f4]"
                  >
                    Sign out
                  </button>
                </div>
              </section>

              <footer className="pb-5 pt-1 text-center">
                <p className="text-[10px] font-medium text-[#9aa59f]">
                  SmartCattle Net • Farm intelligence platform
                </p>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}