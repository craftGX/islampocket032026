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
  date: string; // YYYY-MM-DD
  type: "hizb" | "sourate";
  hizbNumber?: number;
  sourateName?: string;
  repetitions?: number;
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

function toYMD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// palette pour les sourates
const sourateColors = [
  "#FF006E",
  "#3A86FF",
  "#FFBE0B",
  "#FB5607",
  "#8338EC",
  "#0CCE6B",
  "#FF1493",
  "#00C2FF",
  "#FF4D00",
  "#9B5DE5",
  "#06D6A0",
  "#FF595E",
];

function getSourateColor(name: string) {
  const key = name.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const index = hash % sourateColors.length;
  return sourateColors[index];
}

export default function RecapTotalCard() {
  const [quranEntries, setQuranEntries] = useState<QuranEntry[]>([]);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  useEffect(() => {
    const t = new Date();
    const localToday = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    setToday(localToday);

    if (typeof window === "undefined") return;

    const qSaved = window.localStorage.getItem("quranEntries");
    if (qSaved) {
      try {
        setQuranEntries(JSON.parse(qSaved));
      } catch {
        setQuranEntries([]);
      }
    }
  }, []);

  const {
    totalHizbAllTime,
    totalSouratesAllTime,
    thisMonthHizb,
    chartLabelsMonth,
    chartDataHizbMonth,
    monthKeysSorted,
    monthlyHizb,
    currentYear,
    hizbByDay,
    souratesByDay,
  } = useMemo(() => {
    let totalHizbAllTime = 0;
    let totalSouratesAllTime = 0;
    let thisMonthHizb = 0;

    const hizbByDay = new Map<string, number>();
    const souratesByDay = new Map<string, { name: string; repetitions: number }[]>();

    const monthlyHizb = new Map<string, number>();
    let currentYear: number | null = null;

    const chartLabelsMonth: string[] = [];
    const chartDataHizbMonth: number[] = [];

    if (!today) {
      return {
        totalHizbAllTime,
        totalSouratesAllTime,
        thisMonthHizb,
        chartLabelsMonth,
        chartDataHizbMonth,
        monthKeysSorted: [] as string[],
        monthlyHizb,
        currentYear,
        hizbByDay,
        souratesByDay,
      };
    }

    currentYear = today.getFullYear();

    // Quran entries
    quranEntries.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      const dayKey = e.date;
      const monthKey = formatMonthKey(d);

      if (e.type === "hizb") {
        totalHizbAllTime += 1;
        if (isSameMonth(d, today)) thisMonthHizb += 1;
        hizbByDay.set(dayKey, (hizbByDay.get(dayKey) || 0) + 1);
        monthlyHizb.set(monthKey, (monthlyHizb.get(monthKey) || 0) + 1);
      }
      if (e.type === "sourate") {
        totalSouratesAllTime += 1;
        const list = souratesByDay.get(dayKey) || [];
        if (e.sourateName && e.repetitions != null) {
          list.push({ name: e.sourateName, repetitions: e.repetitions });
        }
        souratesByDay.set(dayKey, list);
      }
    });

    // Graphique du mois en cours
    const year = today.getFullYear();
    const monthIndex = today.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth && day <= today.getDate(); day++) {
      const d = new Date(year, monthIndex, day);
      const label = d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      chartLabelsMonth.push(label);

      const key = toYMD(d);
      chartDataHizbMonth.push(hizbByDay.get(key) || 0);
    }

    const monthKeysSorted = Array.from(monthlyHizb.keys()).sort((a, b) =>
      a < b ? 1 : a > b ? -1 : 0,
    );

    return {
      totalHizbAllTime,
      totalSouratesAllTime,
      thisMonthHizb,
      chartLabelsMonth,
      chartDataHizbMonth,
      monthKeysSorted,
      monthlyHizb,
      currentYear,
      hizbByDay,
      souratesByDay,
    };
  }, [quranEntries, today]);

  useEffect(() => {
    if (today) {
      const mk = formatMonthKey(today);
      setSelectedMonthKey(mk);
    }
  }, [today]);

  const monthLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

  const chartDatasetMonth = {
    labels: chartLabelsMonth,
    datasets: [
      {
        label: "Hizb / jour (mois en cours)",
        data: chartDataHizbMonth,
        borderColor: "rgba(129, 140, 248, 1)",
        backgroundColor: "rgba(129, 140, 248, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const selectedStats = useMemo(() => {
    if (!selectedMonthKey) {
      return {
        label: "",
        hizb: 0,
        prevLabel: "",
        prevHizb: 0,
        diffHizb: 0,
      };
    }

    const currentHizb = monthlyHizb.get(selectedMonthKey) || 0;

    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr);
    const prevDate = new Date(y, m - 1, 1);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevKey = formatMonthKey(prevDate);

    const prevHizb = monthlyHizb.get(prevKey) || 0;

    const diffHizb =
      prevHizb === 0
        ? currentHizb > 0
          ? 100
          : 0
        : Math.round(((currentHizb - prevHizb) / prevHizb) * 100);

    return {
      label: formatMonthLabel(selectedMonthKey),
      hizb: currentHizb,
      prevLabel: formatMonthLabel(prevKey),
      prevHizb,
      diffHizb,
    };
  }, [selectedMonthKey, monthlyHizb]);

  const yearlyRows = useMemo(() => {
    if (!currentYear) return [];

    const rows: {
      key: string;
      label: string;
      hizb: number;
      diffHizb: number;
    }[] = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const d = new Date(currentYear, monthIndex, 1);
      const key = formatMonthKey(d);
      const hizb = monthlyHizb.get(key) || 0;

      const prevDate = new Date(currentYear, monthIndex, 1);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevKey = formatMonthKey(prevDate);
      const prevHizb = monthlyHizb.get(prevKey) || 0;

      const diffHizb =
        prevHizb === 0 ? (hizb > 0 ? 100 : 0) : Math.round(((hizb - prevHizb) / prevHizb) * 100);

      rows.push({
        key,
        label: d.toLocaleDateString("fr-FR", { month: "long" }),
        hizb,
        diffHizb,
      });
    }

    return rows;
  }, [currentYear, monthlyHizb]);

  const calendarDays = useMemo(() => {
    if (!selectedMonthKey) return [];

    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr) - 1;

    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const days: (Date | null)[] = [];

    const startWeekday = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
      days.push(new Date(y, m, d));
    }

    return days;
  }, [selectedMonthKey]);

  const selectedDayStats = useMemo(() => {
    if (!selectedDayKey) return null;

    const hizb = hizbByDay.get(selectedDayKey) || 0;
    const sourates = souratesByDay.get(selectedDayKey) || [];

    const sourateMap = new Map<string, number>();
    sourates.forEach((s) => {
      const key = s.name.trim().toLowerCase();
      sourateMap.set(key, (sourateMap.get(key) || 0) + (s.repetitions || 0));
    });
    const souratesMerged = Array.from(sourateMap.entries()).map(([name, repetitions]) => ({
      name,
      repetitions,
    }));

    return {
      hizb,
      sourates: souratesMerged,
    };
  }, [selectedDayKey, hizbByDay, souratesByDay]);

  const selectedDayLabel =
    selectedDayKey &&
    new Date(selectedDayKey + "T00:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const souratesTable = useMemo(() => {
    if (!selectedMonthKey) return [];

    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr) - 1;

    const map = new Map<string, number>();

    quranEntries.forEach((e) => {
      if (e.type !== "sourate" || !e.sourateName || e.repetitions == null) return;
      const d = new Date(e.date + "T00:00:00");
      if (d.getFullYear() !== y || d.getMonth() !== m) return;

      const key = e.sourateName.trim().toLowerCase();
      map.set(key, (map.get(key) || 0) + e.repetitions);
    });

    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [quranEntries, selectedMonthKey]);

  // Navigation mois précédent
  const goToPreviousMonth = () => {
    if (!selectedMonthKey) return;
    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr) - 1;
    const prevDate = new Date(y, m, 1);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevKey = formatMonthKey(prevDate);
    setSelectedMonthKey(prevKey);
    setSelectedDayKey(null);
  };

  // Navigation mois suivant
  const goToNextMonth = () => {
    if (!selectedMonthKey) return;
    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr) - 1;
    const nextDate = new Date(y, m, 1);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextKey = formatMonthKey(nextDate);

    // Ne pas aller au-delà du mois en cours
    if (today && nextDate <= today) {
      setSelectedMonthKey(nextKey);
      setSelectedDayKey(null);
    }
  };

  // Export JSON
  const exportMonthData = () => {
    if (!selectedMonthKey) return;

    const [yearStr, monthStr] = selectedMonthKey.split("-");
    const y = Number(yearStr);
    const m = Number(monthStr) - 1;

    // Filtrer les entrées du mois sélectionné
    const monthEntries = quranEntries.filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getFullYear() === y && d.getMonth() === m;
    });

    const exportData = {
      mois: formatMonthLabel(selectedMonthKey),
      totalHizb: monthlyHizb.get(selectedMonthKey) || 0,
      totalSourates: souratesTable.reduce((acc, s) => acc + s.total, 0),
      sourates: souratesTable,
      entrées: monthEntries,
    };

    // Créer le fichier JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quran-${selectedMonthKey}.json`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Vérifier si on est au mois actuel
  const isCurrentMonth =
    today && selectedMonthKey ? formatMonthKey(today) === selectedMonthKey : false;

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

      {/* Totaux globaux + ce mois-ci */}
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
          <p style={{ margin: 0, color: "#6b7280" }}>Sourates (total)</p>
          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>{totalSouratesAllTime}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.75rem" }}>Hizb ce mois-ci</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{thisMonthHizb}</p>
        </div>
      </div>

      {/* Graphique du mois en cours */}
      {chartLabelsMonth.length > 0 && (
        <div style={{ height: "180px", marginBottom: "0.75rem" }}>
          <Line
            data={chartDatasetMonth}
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
              onChange={(e) => {
                const mk = e.target.value;
                setSelectedMonthKey(mk);
                setSelectedDayKey(null);
              }}
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
            </div>
          )}
        </>
      )}

      {/* Tableau des sourates du mois */}
      {souratesTable.length > 0 && (
        <div
          style={{
            marginTop: "0.6rem",
            marginBottom: "0.6rem",
            fontSize: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              background: "#f3f4f6",
              padding: "4px 6px",
              fontWeight: 600,
            }}
          >
            <span>Sourate</span>
            <span style={{ textAlign: "right" }}>Total lectures</span>
          </div>
          {souratesTable.map((row) => {
            const color = getSourateColor(row.name);
            return (
              <div
                key={row.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  padding: "6px 8px",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "999px",
                      backgroundColor: color,
                      boxShadow: `0 0 0 2px ${color}33`,
                    }}
                  />
                  <strong
                    style={{
                      fontWeight: 800,
                      color,
                      textTransform: "capitalize",
                    }}
                  >
                    {row.name}
                  </strong>
                </span>
                <span
                  style={{
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {row.total}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bouton export */}
      {selectedMonthKey && (
        <div style={{ marginBottom: "0.6rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={exportMonthData}
            className="btn"
            style={{
              fontSize: "0.8rem",
              padding: "6px 12px",
              backgroundColor: "#8338EC",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            📥 Exporter {formatMonthLabel(selectedMonthKey)}
          </button>
        </div>
      )}

      <div
        style={{
          height: "1px",
          backgroundColor: "#e5e7eb",
          margin: "6px 0 8px",
        }}
      />

      {/* Tableau année en cours */}
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
                gridTemplateColumns: "1.4fr 0.8fr 0.9fr",
                background: "#f3f4f6",
                padding: "4px 6px",
                fontWeight: 600,
              }}
            >
              <span>Mois</span>
              <span style={{ textAlign: "right" }}>Hizb</span>
              <span style={{ textAlign: "right" }}>% Hizb</span>
            </div>
            {yearlyRows.map((row) => (
              <div
                key={row.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 0.8fr 0.9fr",
                  padding: "4px 6px",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: selectedMonthKey === row.key ? "#eef2ff" : "#ffffff",
                }}
              >
                <span>{row.label}</span>
                <span style={{ textAlign: "right", fontWeight: 600 }}>{row.hizb}</span>
                <span
                  style={{
                    textAlign: "right",
                    color: row.diffHizb > 0 ? "#15803d" : row.diffHizb < 0 ? "#b91c1c" : "#4b5563",
                  }}
                >
                  {row.diffHizb > 0 ? "+" : ""}
                  {row.diffHizb}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Calendrier + récap jour */}
      <h3 style={{ fontSize: "0.95rem", marginTop: "1rem" }}>Calendrier & récap journalier</h3>

      {/* Navigation mois */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={goToPreviousMonth}
          style={{
            padding: "4px 8px",
            fontSize: "0.85rem",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          ◀ Précédent
        </button>
        <p style={{ fontSize: "0.8rem", color: "#777", margin: 0 }}>
          {selectedStats.label || formatMonthLabel(selectedMonthKey)}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          style={{
            padding: "4px 8px",
            fontSize: "0.85rem",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            cursor: isCurrentMonth ? "not-allowed" : "pointer",
            opacity: isCurrentMonth ? 0.5 : 1,
          }}
        >
          Suivant ▶
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "4px",
          fontSize: "0.8rem",
          marginBottom: "0.4rem",
        }}
      >
        {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontWeight: 600, color: "#6b7280" }}>
            {d}
          </div>
        ))}
        {calendarDays.map((d, index) => {
          if (!d) {
            return <div key={`empty-${index}`} />;
          }
          const key = toYMD(d);
          const hizb = hizbByDay.get(key) || 0;
          const hasSourates = (souratesByDay.get(key) || []).length > 0;
          const hasActivity = hizb > 0 || hasSourates;
          const isSelected = selectedDayKey === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDayKey(key)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #4f46e5" : "1px solid #e5e7eb",
                padding: "4px 2px",
                backgroundColor: isSelected ? "#eef2ff" : "#ffffff",
                cursor: "pointer",
                minHeight: "42px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{d.getDate()}</span>
              {hasActivity && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedDayKey && selectedDayStats && (
        <div
          style={{
            marginTop: "0.4rem",
            padding: "6px 8px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "0.8rem",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{selectedDayLabel}</p>
          <p style={{ margin: "2px 0" }}>
            Hizb : <strong>{selectedDayStats.hizb}</strong>
          </p>
          <p style={{ margin: "2px 0" }}>
            Sourates :{" "}
            <strong>
              {selectedDayStats.sourates.length > 0
                ? selectedDayStats.sourates.map((s) => `${s.name} × ${s.repetitions}`).join(" | ")
                : "Aucune"}
            </strong>
          </p>
        </div>
      )}

      {selectedDayKey && selectedDayStats && (
        <div
          onClick={() => setSelectedDayKey(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(88, 28, 135, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            padding: "0.75rem",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "#f5e9ff",
              borderRadius: "1.25rem 1.25rem 0 0",
              padding: "1rem 1rem 1.25rem",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 -10px 25px rgba(76,29,149,0.35)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "4px",
                borderRadius: "999px",
                background: "#e5e7eb",
                margin: "0 auto 0.75rem",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.05rem",
                  margin: 0,
                }}
              >
                Récap de la journée
              </h2>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: "0.9rem",
                color: "#4b5563",
                marginBottom: "0.4rem",
              }}
            >
              {selectedDayLabel}
            </p>

            <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
              Hizb lus : <strong>{selectedDayStats.hizb}</strong>
            </p>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
              Sourates travaillées :{" "}
              <strong>
                {selectedDayStats.sourates.length > 0
                  ? selectedDayStats.sourates.map((s) => `${s.name} × ${s.repetitions}`).join(" | ")
                  : "Aucune"}
              </strong>
            </p>

            <div style={{ textAlign: "center", marginTop: "0.8rem" }}>
              <button
                type="button"
                className="btn"
                style={{ paddingInline: "1.2rem" }}
                onClick={() => setSelectedDayKey(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
