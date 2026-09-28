"use client";

import { useEffect, useState } from "react";

import ReportCard from "./components/ReportCard";
import DeliveryPanel from "./components/DeliveryPanel";
import HistorySection from "./components/HistorySection";
import FloatingButton from "./components/FloatingButton";

import { reportCards, deliveryOptions } from "./reportData";

const API_BASE_URL = "http://127.0.0.1:8000";

interface ReportHistoryItem {
  id?: string;
  name: string;
  timestamp: string;
  period: string;
  status: string;
  downloadUrl?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [error, setError] = useState("");

  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    return token;
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/reports/history`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        throw new Error(`Failed to load report history (${response.status}).`);
      }

      const data = await response.json();

      const history = Array.isArray(data)
        ? data
        : Array.isArray(data?.reports)
          ? data.reports
          : [];

      setReports(history);
    } catch (err) {
      console.error("Report history error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load report history.",
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const generateReport = async (reportTitle: string) => {
    try {
      setGeneratingReport(reportTitle);
      setError("");

      const token = getToken();

      let endpoint = "";

      if (reportTitle === "Daily Herd Summary") {
        endpoint = "/reports/summary/daily";
      } else if (reportTitle === "Weekly Vet Digest") {
        endpoint = "/reports/summary/weekly";
      } else if (reportTitle === "Monthly Productivity") {
        endpoint = "/reports/summary/monthly";
      } else {
        throw new Error("Unknown report type.");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        throw new Error(
          `Failed to generate ${reportTitle} (${response.status}).`,
        );
      }

      const reportData = await response.json();

      /*
       * For now we log the real backend response.
       * The next step is to connect this response to the
       * actual downloadable report endpoint/file.
       */
      console.log(`${reportTitle} generated:`, reportData);

      await loadHistory();
    } catch (err) {
      console.error("Report generation error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to generate report.",
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  const downloadReport = async (report: ReportHistoryItem) => {
    try {
      setError("");

      const token = getToken();

      /*
       * This requires the backend to provide an actual
       * report download endpoint.
       *
       * We should NOT pretend that /reports/history itself
       * is a downloadable file.
       */
      if (!report.id && !report.downloadUrl) {
        throw new Error("This report does not have a downloadable file yet.");
      }

      const url = report.downloadUrl
        ? report.downloadUrl
        : `${API_BASE_URL}/reports/${report.id}/download`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download report (${response.status}).`);
      }

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${report.name}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Report download error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to download report.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F5FAF6] px-7 py-6 text-[#17251F]">
      {/* ================= PAGE HEADING ================= */}

      <section className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-bold text-[#006B4F]">
            On-Demand Intelligence
          </h1>

          <p className="mt-1 font-serif text-[12px] text-[#52645B]">
            Generate high-fidelity reports instantly from live telemetry data.
          </p>
        </div>

        <p className="pt-2 text-[12px] font-semibold text-[#5147B8]">
          AI-Enhanced Analysis
        </p>
      </section>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================= REPORT CARDS ================= */}

      <section className="grid grid-cols-3 gap-3">
        {reportCards.map((card, index) => (
          <ReportCard
            key={index}
            icon={card.icon}
            iconBg={card.iconBg}
            title={card.title}
            description={card.description}
            period={card.period}
            buttonText={
              generatingReport === card.title
                ? "Generating..."
                : card.buttonText
            }
            buttonColor={card.buttonColor}
            onGenerate={() => void generateReport(card.title)}
            disabled={generatingReport !== null}
          />
        ))}
      </section>

      {/* ================= BOTTOM SECTION ================= */}

      <section className="mt-7 grid grid-cols-[295px_1fr] gap-5 items-start">
        {/* LEFT */}

        <DeliveryPanel options={deliveryOptions} />

        {/* RIGHT */}

        <HistorySection
          reports={reports}
          loading={loadingHistory}
          onDownload={downloadReport}
        />
      </section>

      {/* ================= FLOATING BUTTON ================= */}

      <FloatingButton />
    </main>
  );
}
