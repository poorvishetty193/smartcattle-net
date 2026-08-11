"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface OverviewData {
  farm_name: string;
  welcome_message: string;
  last_sync: string;
  thi: number;
  status: string;
}

export default function Overview() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await apiGet("/dashboard/overview");

      console.log("Overview Response:", data);

      setOverview(data);
    } catch (error) {
      console.error("Overview Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!overview) {
    return null;
  }

  return null;
}
