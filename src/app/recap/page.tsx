"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameWeek(a: Date, b: Date) {
  return startOfWeekMonday(a).getTime() === startOfWeekMonday(b).getTime();
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toYMD(d: Date) {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getLastFriday(today: Date) {
  const d = new Date(today);
  const day = d.getDay();
  const diff = (day + 1 + 7 - 5) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const HIZB_PER_DAY_TARGET = 4;

export default function RecapPage() {
  const [today, setToday] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [monthStart, setMonthStart] = useState<Date | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const [quranEntries, setQuranEntries] = useState<QuranEntry[]>([]);
  const [prieresDays, setPrieresDays] = useState<DayCount[]>([]);
  const [lastFriday, setLastFriday] = useState<Date | null>(null);
  const [lastFridayKey, setLastFridayKey] = useState<string>("");

  useEffect(() => {
    const t = new Date();
    const ws = startOfWeekMonday(t);
    const ms = startOfMonth(t);
    const lf = getLastFriday(t);

    setToday(t);
    setWeekStart(ws);
    setMonthStart(ms);
    setCurrentYear(t.getFullYear());
    setLastFriday(lf);
    setLastFridayKey(formatDateISO(lf));

    const qSaved = localStorage.getItem("quranEntries");
    if (qSaved) {
      try {
        setQuranEntries(JSON.parse(qSaved));
      } catch {
        setQuranEntries([]);
      }
    }

    const pSaved = localStorage.getItem("prieresByDay");
    if (pSaved) {
      try {
        setPrieresDays(JSON.parse(pSaved));
      } catch {
        setPrieresDays([]);
      }
    }
  }, []);

  /* --- Récap Quran --- */

  const {
    weekHizbCount,
    monthHizbCount,
    yearHizbCount,
    weekHizbNumbers,
    weekSouratesMap,
    prevWeekHizbCount,
    prevMonthHizbCount,
  } = useMemo(() => {
    if (!today || !currentYear || !weekStart || !monthStart) {
      return {
        weekHizbCount: 0,
        monthHizbCount: 0,
        yearHizbCount: 0,
        weekHizbNumbers: [] as number[],
        weekSouratesMap: new Map<string, { repetitions: number; weekKey: string }>(),
        prevWeekHizbCount: 0,
        prevMonthHizbCount: 0,
      };
    }

    let weekHizbCount = 0;
    let monthHizbCount = 0;
    let yearHizbCount = 0;
    let prevWeekHizbCount = 0;
    let prevMonthHizbCount = 0;

    const weekHizbNumbers: number[] = [];
    const weekSouratesMap = new Map<string, { repetitions: number; weekKey: string }>();

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(prevWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    const prevMonthDate = new Date(monthStart);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth() + 1, 0);
    prevMonthEnd.setHours(23, 59, 59, 999);

    quranEntries.forEach((e) => {
      const d = new Date(e.date);

      const inYear = d.getFullYear() === currentYear;
      const inWeek = isSameWeek(d, today);
      const inMonth = isSameMonth(d, today);

      const inPrevWeek = d >= prevWeekStart && d <= prevWeekEnd;
      const inPrevMonth = d >= prevMonthStart && d <= prevMonthEnd;

      if (e.type === "hizb") {
        const num = e.hizbNumber ?? 0;

        if (inWeek) {
          weekHizbCount += 1;
          if (num > 0) weekHizbNumbers.push(num);
        }

        if (inMonth) monthHizbCount += 1;
        if (inYear) yearHizbCount += 1;

        if (inPrevWeek) prevWeekHizbCount += 1;
        if (inPrevMonth) prevMonthHizbCount += 1;
      }

      if (e.type === "sourate" && e.sourateName) {
        const reps = e.repetitions ?? 0;
        if (inWeek) {
          const wk = startOfWeekMonday(d).toISOString().slice(0, 10);
          const key = `${e.sourateName}-${wk}`;
          const existing = weekSouratesMap.get(key);
          if (existing) {
            existing.repetitions += reps;
          } else {
            weekSouratesMap.set(key, { repetitions: reps, weekKey: wk });
          }
        }
      }
    });

    return {
      weekHizbCount,
      monthHizbCount,
      yearHizbCount,
      weekHizbNumbers,
      weekSouratesMap,
      prevWeekHizbCount,
      prevMonthHizbCount,
    };
  }, [quranEntries, today, currentYear, weekStart, monthStart]);

  const weekSouratesList = useMemo(() => {
    return Array.from(weekSouratesMap.entries()).map(([key, value]) => {
      const [name] = key.split("-");
      return { name, repetitions: value.repetitions };
    });
  }, [weekSouratesMap]);

  const percentWeek = useMemo(() => {
    if (!today || !weekStart) return 0;

    const daysSinceWeekStart =
      1 + Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const targetWeek = HIZB_PER_DAY_TARGET * daysSinceWeekStart;

    return targetWeek > 0 ? Math.min(100, Math.round((weekHizbCount / targetWeek) * 100)) : 0;
  }, [today, weekStart, weekHizbCount]);

  const weekDiff =
    prevWeekHizbCount === 0
      ? weekHizbCount > 0
        ? 100
        : 0
      : Math.round(((weekHizbCount - prevWeekHizbCount) / prevWeekHizbCount) * 100);

  const monthDiff =
    prevMonthHizbCount === 0
      ? monthHizbCount > 0
        ? 100
        : 0
      : Math.round(((monthHizbCount - prevMonthHizbCount) / prevMonthHizbCount) * 100);

  const weekLabel =
    weekStart &&
    `${weekStart.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    })} ➜ ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    })}`;

  const monthLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

  const monthDayHizbMap = useMemo(() => {
    const map = new Map<number, number>();
    if (!monthStart) return map;
    quranEntries.forEach((e) => {
      if (e.type !== "hizb") return;
      const d = new Date(e.date);
      if (!isSameMonth(d, monthStart)) return;
      const day = d.getDate();
      map.set(day, (map.get(day) || 0) + 1);
    });
    return map;
  }, [quranEntries, monthStart]);

  /* --- Récap prières sur le Prophète --- */

  const totalSalawat = useMemo(
    () => prieresDays.reduce((sum, d) => sum + d.count, 0),
    [prieresDays],
  );

  const { weekSalawat, monthSalawat } = useMemo(() => {
    if (!today) return { weekSalawat: 0, monthSalawat: 0 };
    let ws = 0;
    let ms = 0;
    prieresDays.forEach((d) => {
      const date = new Date(d.date);
      if (isSameWeek(date, today)) ws += d.count;
      if (isSameMonth(date, today)) ms += d.count;
    });
    return { weekSalawat: ws, monthSalawat: ms };
  }, [prieresDays, today]);

  const lastFridayCount = useMemo(() => {
    if (!lastFridayKey) return 0;
    return prieresDays.find((d) => d.date === lastFridayKey)?.count ?? 0;
  }, [prieresDays, lastFridayKey]);

  const todayKey = today ? formatDateISO(today) : "";
  const todayCount = useMemo(() => {
    if (!todayKey) return 0;
    return prieresDays.find((d) => d.date === todayKey)?.count ?? 0;
  }, [prieresDays, todayKey]);

  const comparePercent =
    lastFridayCount === 0
      ? todayCount > 0
        ? 100
        : 0
      : Math.round(((todayCount - lastFridayCount) / lastFridayCount) * 100);

  const lastFridayLabel =
    lastFriday &&
    lastFriday.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const sortedSalawat = useMemo(
    () => [...prieresDays].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [prieresDays],
  );

  const todayLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Récap global</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {todayLabel || "Chargement de la date..."}
      </p>

      {/* Quran - récap complet */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Quran – Synthèse</h2>
        <p style={{ fontSize: "0.9rem" }}>
          Semaine du {weekLabel || "..."} : <strong>{weekHizbCount}</strong> hizb • {percentWeek}%
          de l&apos;objectif
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Mois ({monthLabel || "..."}) : <strong>{monthHizbCount}</strong> hizb
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Année {currentYear ?? "..."} : <strong>{yearHizbCount}</strong> hizb
        </p>
      </section>

      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Quran – Comparatif</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>
          Semaine actuelle : <strong>{weekHizbCount}</strong> hizb
          <br />
          Semaine précédente : <strong>{prevWeekHizbCount}</strong> hizb
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: weekDiff > 0 ? "#15803d" : weekDiff < 0 ? "#b91c1c" : "#4b5563",
            marginBottom: "0.6rem",
          }}
        >
          Évolution semaine : {weekDiff > 0 ? "+" : ""}
          {weekDiff}%
        </p>

        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>
          Mois actuel : <strong>{monthHizbCount}</strong> hizb
          <br />
          Mois précédent : <strong>{prevMonthHizbCount}</strong> hizb
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: monthDiff > 0 ? "#15803d" : monthDiff < 0 ? "#b91c1c" : "#4b5563",
          }}
        >
          Évolution mois : {monthDiff > 0 ? "+" : ""}
          {monthDiff}%
        </p>
      </section>

      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Quran – Détail de la semaine</h2>
        {weekHizbNumbers.length === 0 && weekSouratesList.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>
            Aucun hizb ou sourate enregistré pour cette semaine.
          </p>
        )}

        {weekHizbNumbers.length > 0 && (
          <div style={{ marginBottom: "0.6rem" }}>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>Hizb lus cette semaine :</p>
            <p
              style={{
                fontSize: "0.9rem",
                padding: "0.4rem 0.6rem",
                borderRadius: "8px",
                background: "#edf2f7",
              }}
            >
              {weekHizbNumbers.sort((a, b) => a - b).join(", ")} ({weekHizbNumbers.length} hizb)
            </p>
          </div>
        )}

        {weekSouratesList.length > 0 && (
          <div>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>
              Sourates travaillées cette semaine :
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {weekSouratesList.map((s) => (
                <li
                  key={s.name}
                  style={{
                    fontSize: "0.9rem",
                    padding: "0.3rem 0.4rem",
                    borderRadius: "6px",
                    background: "#f7fafc",
                    marginBottom: "0.2rem",
                  }}
                >
                  {s.name} • {s.repetitions} répétitions
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Vue mensuelle Quran */}
      <section className="list-item" style={{ marginBottom: "1.5rem" }}>
        <h2>Quran – Vue mensuelle</h2>
        <p style={{ fontSize: "0.8rem", color: "#777", marginBottom: "0.3rem" }}>
          Plus la couleur est foncée, plus tu as lu ce jour-là.
        </p>

        {monthStart &&
          (() => {
            const daysInMonth = new Date(
              monthStart.getFullYear(),
              monthStart.getMonth() + 1,
              0,
            ).getDate();

            const getDayColor = (count: number) => {
              if (count === 0) return "#f3f4f6";
              if (count === 1) return "#e0f2f1";
              if (count === 2) return "#80cbc4";
              if (count === 3) return "#26a69a";
              return "#00796b";
            };

            const isTodayDay = (dayNumber: number) =>
              today &&
              today.getFullYear() === monthStart.getFullYear() &&
              today.getMonth() === monthStart.getMonth() &&
              today.getDate() === dayNumber;

            return (
              <div style={{ fontSize: "0.7rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: "0.1rem",
                    color: "#6b7280",
                    marginBottom: "0.15rem",
                    textAlign: "center",
                  }}
                >
                  {["L", "Ma", "Me", "J", "V", "S", "D"].map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: "0.1rem",
                  }}
                >
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const date = new Date(
                      monthStart.getFullYear(),
                      monthStart.getMonth(),
                      dayNumber,
                    );
                    const jsDay = date.getDay();
                    const offset = (jsDay + 6) % 7;

                    const isFirstOfMonth = dayNumber === 1;
                    const blanks =
                      isFirstOfMonth && offset > 0
                        ? Array.from({ length: offset }).map((__, idx) => (
                            <div key={`blank-${dayNumber}-${idx}`} style={{ minHeight: "18px" }} />
                          ))
                        : [];

                    const count = monthDayHizbMap.get(dayNumber) || 0;
                    const bg = getDayColor(count);
                    const todayFlag = isTodayDay(dayNumber);

                    return (
                      <React.Fragment key={`day-${dayNumber}`}>
                        {blanks}
                        <div
                          style={{
                            minHeight: "18px",
                            borderRadius: "0.35rem",
                            backgroundColor: bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            padding: "0.05rem 0.1rem",
                            color: count > 0 ? "#004d40" : "#6b7280",
                            boxShadow: todayFlag
                              ? "0 0 0 1px rgba(37,99,235,0.9)"
                              : "0 0 0 1px rgba(148,163,184,0.2)",
                          }}
                        >
                          <span style={{ fontWeight: 600, lineHeight: 1 }}>{dayNumber}</span>
                          {count > 0 && (
                            <span style={{ fontSize: "0.55rem", lineHeight: 1 }}>{count}h</span>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })()}
      </section>

      {/* Prières sur le Prophète – récap complet */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Salat sur le Prophète ﷺ – Synthèse</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Total : <strong>{totalSalawat}</strong> prières
        </p>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Cette semaine : <strong>{weekSalawat}</strong> prières
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Ce mois-ci : <strong>{monthSalawat}</strong> prières
        </p>
      </section>

      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Salat sur le Prophète ﷺ – Comparatif vendredi</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>
          Aujourd&apos;hui : <strong>{todayCount}</strong> prières
          <br />
          Vendredi dernier ({lastFridayLabel || "..."}) : <strong>{lastFridayCount}</strong> prières
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: comparePercent > 0 ? "#15803d" : comparePercent < 0 ? "#b91c1c" : "#4b5563",
          }}
        >
          Évolution : {comparePercent > 0 ? "+" : ""}
          {comparePercent}%
        </p>
      </section>

      <section className="list-item" style={{ marginBottom: "1.5rem" }}>
        <h2>Salat sur le Prophète ﷺ – Historique complet</h2>
        {sortedSalawat.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>
            Aucune prière enregistrée pour l&apos;instant.
          </p>
        )}

        {sortedSalawat.map((d) => {
          const label = new Date(d.date).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const isToday = todayKey && d.date === todayKey;
          const isLastFriday = lastFridayKey && d.date === lastFridayKey;

          return (
            <div
              key={d.date}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.35rem 0.2rem",
                borderTop: "1px solid #e5e7eb",
                marginTop: "0.15rem",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  {label}{" "}
                  {isToday && (
                    <span style={{ fontSize: "0.8rem", color: "#2563eb" }}>(aujourd&apos;hui)</span>
                  )}
                  {isLastFriday && !isToday && (
                    <span style={{ fontSize: "0.8rem", color: "#16a34a" }}>(vendredi dernier)</span>
                  )}
                </p>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {d.count}
                </span>{" "}
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>prières</span>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
