"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

type QuranEntry = {
  id: string;
  date: string;
  type: "hizb" | "sourate";
  hizbNumber?: number;
  sourateName?: string;
  repetitions?: number;
};

type DayCount = {
  date: string;
  count: number;
};

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function RecapTotalCard() {
  const [quranEntries, setQuranEntries] = useState<QuranEntry[]>([]);
  const [prieresDays, setPrieresDays] = useState<DayCount[]>([]);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");

  useEffect(() => {
    const t = new Date();
    setToday(t);

    const qSaved = typeof window !== "undefined" ? localStorage.getItem("quranEntries") : null;
    if (qSaved) {
      try {
        setQuranEntries(JSON.parse(qSaved));
      } catch {
        setQuranEntries([]);
      }
    }

    const pSaved = typeof window !== "undefined" ? localStorage.getItem("prieresByDay") : null;
    if (pSaved) {
      try {
        setPrieresDays(JSON.parse(pSaved));
      } catch {
        setPrieresDays([]);
      }
    }
  }, []);

  const {
    totalHizbAllTime,
    totalSouratesAllTime,
    totalSalawatAllTime,
    thisMonthHizb,
    thisMonthSalawat,
    chartLabels,
    chartDataHizb,
    chartDataSalawat,
    monthKeysSorted,
    monthlyHizb,
    monthlySalawat,
    currentYear,
  } = useMemo(() => {
    let totalHizbAllTime = 0;
    let totalSouratesAllTime = 0;
    let totalSalawatAllTime = 0;
    let thisMonthHizb = 0;
    let thisMonthSalawat = 0;

    const labels: string[] = [];
    const hizbByDay = new Map<string, number>();
    const salawatByDay = new Map<string, number>();

    const monthlyHizb = new Map<string, number>();
    const monthlySalawat = new Map<string, number>();
    let currentYear: number | null = null;

    if (!today) {
      return {
        totalHizbAllTime,
        totalSouratesAllTime,
        totalSalawatAllTime,
        thisMonthHizb,
        thisMonthSalawat,
        chartLabels: labels,
        chartDataHizb: [] as number[],
        chartDataSalawat: [] as number[],
        monthKeysSorted: [] as string[],
        monthlyHizb,
        monthlySalawat,
        currentYear,
      };
    }

    currentYear = today.getFullYear();

    // Quran entries
    quranEntries.forEach((e) => {
      const d = new Date(e.date);
      const dayKey = d.toISOString().slice(0, 10);
      const monthKey = formatMonthKey(d);

      if (e.type === "hizb") {
        totalHizbAllTime += 1;
        if (isSameMonth(d, today)) thisMonthHizb += 1;
        hizbByDay.set(dayKey, (hizbByDay.get(dayKey) || 0) + 1);
        monthlyHizb.set(monthKey, (monthlyHizb.get(monthKey) || 0) + 1);
      }
      if (e.type === "sourate") {
        totalSouratesAllTime += 1;
      }
    });

    // Prières sur le prophète
    prieresDays.forEach((d) => {
      const date = new Date(d.date);
      const dayKey = d.date;
      const monthKey = formatMonthKey(date);

      totalSalawatAllTime += d.count;
      if (isSameMonth(date, today)) thisMonthSalawat += d.count;
      salawatByDay.set(dayKey, (salawatByDay.get(dayKey) || 0) + d.count);
      monthlySalawat.set(monthKey, (monthlySalawat.get(monthKey) || 0) + d.count);
    });

    // Labels: 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      labels.push(label);
    }

    const chartDataHizb = labels.map((_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - idx));
      const key = date.toISOString().slice(0, 10);
      return hizbByDay.get(key) || 0;
    });

    const chartDataSalawat = labels.map((_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - idx));
      const key = date.toISOString().slice(0, 10);
      return salawatByDay.get(key) || 0;
    });

    const monthKeysSorted = Array.from(
      new Set([...monthlyHizb.keys(), ...monthlySalawat.keys()]),
    ).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

    return {
      totalHizbAllTime,
      totalSouratesAllTime,
      totalSalawatAllTime,
      thisMonthHizb,
      thisMonthSalawat,
      chartLabels: labels,
      chartDataHizb,
      chartDataSalawat,
      monthKeysSorted,
      monthlyHizb,
      monthlySalawat,
      currentYear,
    };
  }, [quranEntries, prieresDays, today]);

  // Init mois sélectionné = mois courant
  useEffect(() => {
    if (today) {
      setSelectedMonthKey(formatMonthKey(today));
    }
  }, [today]);

  const monthLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

  const chartDataset = {
    labels: chartLabels,
    datasets: [
      {
        label: "Hizb / jour",
        data: chartDataHizb,
        borderColor: "rgba(129, 140, 248, 1)",
        backgroundColor: "rgba(129, 140, 248, 0.2)",
        tension: 0.3,
      },
      {
        label: "Salat sur le Prophète ﷺ",
        data: chartDataSalawat,
        borderColor: "rgba(45, 212, 191, 1)",
        backgroundColor: "rgba(45, 212, 191, 0.2)",
        tension: 0.3,
      },
    ],
  };

  // Comparaison mois sélectionné vs mois précédent (pour le petit bloc)
  const selectedStats = useMemo(() => {
    if (!selectedMonthKey) {
      return {
        label: "",
        hizb: 0,
        salawat: 0,
        prevLabel: "",
        prevHizb: 0,
        prevSalawat: 0,
        diffHizb: 0,
        diffSalawat: 0,
      };
    }

    const currentHizb = monthlyHizb.get(selectedMonthKey) || 0;
    const currentSalawat = monthlySalawat.get(selectedMonthKey) || 0;

    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr);
    const prevDate = new Date(y, m - 1, 1);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevKey = formatMonthKey(prevDate);

    const prevHizb = monthlyHizb.get(prevKey) || 0;
    const prevSalawat = monthlySalawat.get(prevKey) || 0;

    const diffHizb =
      prevHizb === 0
        ? currentHizb > 0
          ? 100
          : 0
        : Math.round(((currentHizb - prevHizb) / prevHizb) * 100);

    const diffSalawat =
      prevSalawat === 0
        ? currentSalawat > 0
          ? 100
          : 0
        : Math.round(((currentSalawat - prevSalawat) / prevSalawat) * 100);

    return {
      label: formatMonthLabel(selectedMonthKey),
      hizb: currentHizb,
      salawat: currentSalawat,
      prevLabel: formatMonthLabel(prevKey),
      prevHizb,
      prevSalawat,
      diffHizb,
      diffSalawat,
    };
  }, [selectedMonthKey, monthlyHizb, monthlySalawat]);

  // Tableau annuel (année en cours, 12 lignes max)
  const yearlyRows = useMemo(() => {
    if (!currentYear) return [];

    const rows: {
      key: string;
      label: string;
      hizb: number;
      salawat: number;
      diffHizb: number;
      diffSalawat: number;
    }[] = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const d = new Date(currentYear, monthIndex, 1);
      const key = formatMonthKey(d);
      const hizb = monthlyHizb.get(key) || 0;
      const salawat = monthlySalawat.get(key) || 0;

      // mois précédent
      const prevDate = new Date(currentYear, monthIndex, 1);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevKey = formatMonthKey(prevDate);
      const prevHizb = monthlyHizb.get(prevKey) || 0;
      const prevSalawat = monthlySalawat.get(prevKey) || 0;

      const diffHizb =
        prevHizb === 0 ? (hizb > 0 ? 100 : 0) : Math.round(((hizb - prevHizb) / prevHizb) * 100);

      const diffSalawat =
        prevSalawat === 0
          ? salawat > 0
            ? 100
            : 0
          : Math.round(((salawat - prevSalawat) / prevSalawat) * 100);

      rows.push({
        key,
        label: d.toLocaleDateString("fr-FR", { month: "long" }),
        hizb,
        salawat,
        diffHizb,
        diffSalawat,
      });
    }

    return rows;
  }, [currentYear, monthlyHizb, monthlySalawat]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{
        marginBottom: "1rem",
      }}
    >
      <h2>Récap total</h2>
      <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "-0.25rem" }}>{monthLabel || ""}</p>

      {/* Totaux globaux + ce mois-ci (origine) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "8px",
          fontSize: "0.85rem",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#6b7280" }}>Hizb lus (total)</p>
          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>{totalHizbAllTime}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: "#6b7280" }}>Salat Prophète (total)</p>
          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>{totalSalawatAllTime}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.75rem" }}>Hizb ce mois-ci</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{thisMonthHizb}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.75rem" }}>Salat ce mois-ci</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{thisMonthSalawat}</p>
        </div>
      </div>

      {/* Sélecteur de mois + comparatif rapide */}
      {monthKeysSorted.length > 0 && (
        <>
          <div
            style={{
              marginTop: "0.25rem",
              marginBottom: "0.5rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <label htmlFor="month-select" style={{ fontSize: "0.8rem", color: "#4b5563" }}>
              Comparer le mois :
            </label>
            <select
              id="month-select"
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              style={{
                fontSize: "0.8rem",
                padding: "4px 6px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
              }}
            >
              {monthKeysSorted.map((key) => (
                <option key={key} value={key}>
                  {formatMonthLabel(key)}
                </option>
              ))}
            </select>
          </div>

          {selectedStats.label && (
            <div
              style={{
                fontSize: "0.8rem",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginBottom: "0.6rem",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{selectedStats.label}</p>
              <p style={{ margin: "2px 0" }}>
                Hizb : <strong>{selectedStats.hizb}</strong> (précédent :{" "}
                <strong>{selectedStats.prevHizb}</strong>) •{" "}
                <span
                  style={{
                    color:
                      selectedStats.diffHizb > 0
                        ? "#15803d"
                        : selectedStats.diffHizb < 0
                          ? "#b91c1c"
                          : "#4b5563",
                  }}
                >
                  {selectedStats.diffHizb > 0 ? "+" : ""}
                  {selectedStats.diffHizb}%
                </span>
              </p>
              <p style={{ margin: 0 }}>
                Salat : <strong>{selectedStats.salawat}</strong> (précédent :{" "}
                <strong>{selectedStats.prevSalawat}</strong>) •{" "}
                <span
                  style={{
                    color:
                      selectedStats.diffSalawat > 0
                        ? "#15803d"
                        : selectedStats.diffSalawat < 0
                          ? "#b91c1c"
                          : "#4b5563",
                  }}
                >
                  {selectedStats.diffSalawat > 0 ? "+" : ""}
                  {selectedStats.diffSalawat}%
                </span>
              </p>
            </div>
          )}
        </>
      )}

      <div
        style={{
          height: "1px",
          backgroundColor: "#e5e7eb",
          margin: "6px 0 8px",
        }}
      />

      {/* Graphique 7 derniers jours (ton graphique d'origine) */}
      {chartLabels.length > 0 && (
        <div style={{ height: "160px" }}>
          <Line
            data={chartDataset}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    font: { size: 10 },
                  },
                },
              },
              scales: {
                x: {
                  ticks: { font: { size: 10 } },
                },
                y: {
                  ticks: { font: { size: 10 } },
                },
              },
            }}
          />
        </div>
      )}

      {/* SECTION EN BAS : tableau année en cours */}
      {yearlyRows.length > 0 && (
        <>
          <h3 style={{ fontSize: "0.95rem", marginTop: "0.8rem" }}>
            Détail de l&apos;année {currentYear}
          </h3>
          <div
            style={{
              fontSize: "0.8rem",
              marginTop: "0.25rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.9fr 0.9fr",
                background: "#f3f4f6",
                padding: "4px 6px",
                fontWeight: 600,
              }}
            >
              <span>Mois</span>
              <span style={{ textAlign: "right" }}>Hizb</span>
              <span style={{ textAlign: "right" }}>Salat</span>
              <span style={{ textAlign: "right" }}>% Hizb</span>
              <span style={{ textAlign: "right" }}>% Salat</span>
            </div>
            {yearlyRows.map((row) => (
              <div
                key={row.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.9fr 0.9fr",
                  padding: "4px 6px",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: selectedMonthKey === row.key ? "#eef2ff" : "#ffffff",
                }}
              >
                <span>{row.label}</span>
                <span style={{ textAlign: "right", fontWeight: 600 }}>{row.hizb}</span>
                <span style={{ textAlign: "right", fontWeight: 600 }}>{row.salawat}</span>
                <span
                  style={{
                    textAlign: "right",
                    color: row.diffHizb > 0 ? "#15803d" : row.diffHizb < 0 ? "#b91c1c" : "#4b5563",
                  }}
                >
                  {row.diffHizb > 0 ? "+" : ""}
                  {row.diffHizb}%
                </span>
                <span
                  style={{
                    textAlign: "right",
                    color:
                      row.diffSalawat > 0 ? "#15803d" : row.diffSalawat < 0 ? "#b91c1c" : "#4b5563",
                  }}
                >
                  {row.diffSalawat > 0 ? "+" : ""}
                  {row.diffSalawat}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}
