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

const HIZB_PER_DAY_TARGET = 4;

export default function QuranTracker() {
  const [entries, setEntries] = useState<QuranEntry[]>([]);
  const [khatmTargetDate, setKhatmTargetDate] = useState<string>("");

  const [hizbNumber, setHizbNumber] = useState<number | "">("");
  const [sourateName, setSourateName] = useState("");
  const [repetitions, setRepetitions] = useState<number | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"hizb" | "sourate" | null>(null);

  const [today, setToday] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [monthStart, setMonthStart] = useState<Date | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  useEffect(() => {
    const t = new Date();
    const ws = startOfWeekMonday(t);
    const ms = startOfMonth(t);
    setToday(t);
    setWeekStart(ws);
    setMonthStart(ms);
    setCurrentYear(t.getFullYear());
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("quranEntries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quranEntries", JSON.stringify(entries));
  }, [entries]);

  const addHizb = () => {
    if (hizbNumber === "" || Number(hizbNumber) <= 0 || !today) return;

    const entry: QuranEntry = {
      id: crypto.randomUUID(),
      date: today.toISOString(),
      type: "hizb",
      hizbNumber: Number(hizbNumber),
    };

    setEntries((prev) => [entry, ...prev]);
    setHizbNumber("");
  };

  const khatmStats = useMemo(() => {
    if (!today || !khatmTargetDate) return null;
    const target = new Date(khatmTargetDate);
    if (target <= today) return null;

    const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const totalHizbForKhatm = 60;
    const hizbPerDayNeeded = Math.ceil(totalHizbForKhatm / daysLeft);

    return { daysLeft, hizbPerDayNeeded };
  }, [today, khatmTargetDate]);

  const addSourate = () => {
    if (!today) return;
    if (!sourateName.trim() || repetitions === "" || Number(repetitions) <= 0) return;

    const entry: QuranEntry = {
      id: crypto.randomUUID(),
      date: today.toISOString(),
      type: "sourate",
      sourateName: sourateName.trim(),
      repetitions: Number(repetitions),
    };

    setEntries((prev) => [entry, ...prev]);
    setSourateName("");
    setRepetitions("");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingType(null);
    }
  };

  const startEditSourate = (entry: QuranEntry) => {
    if (entry.type !== "sourate") return;
    setEditingId(entry.id);
    setEditingType("sourate");
    setSourateName(entry.sourateName || "");
    setRepetitions(entry.repetitions ?? "");
  };

  const startEditHizb = (entry: QuranEntry) => {
    if (entry.type !== "hizb") return;
    setEditingId(entry.id);
    setEditingType("hizb");
    setHizbNumber(entry.hizbNumber ?? "");
  };

  const saveEdit = () => {
    if (!editingId || !editingType) return;

    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== editingId) return e;

        if (editingType === "hizb") {
          if (hizbNumber === "" || Number(hizbNumber) <= 0) return e;
          return { ...e, hizbNumber: Number(hizbNumber) };
        }

        if (!sourateName.trim() || repetitions === "" || Number(repetitions) <= 0) return e;

        return {
          ...e,
          sourateName: sourateName.trim(),
          repetitions: Number(repetitions),
        };
      }),
    );

    setEditingId(null);
    setEditingType(null);
    setHizbNumber("");
    setSourateName("");
    setRepetitions("");
  };

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

    entries.forEach((e) => {
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
  }, [entries, currentYear, today, weekStart, monthStart]);

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

  const todayLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const monthLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

  const weekSouratesList = Array.from(weekSouratesMap.entries()).map(([key, value]) => {
    const [name] = key.split("-");
    return { name, repetitions: value.repetitions };
  });

  const isReady = !!today && !!weekStart && !!monthStart && currentYear !== null;

  const weekDays = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      return d;
    });
  }, [weekStart]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, QuranEntry[]>();
    entries.forEach((e) => {
      const d = new Date(e.date);
      if (!today || !isSameWeek(d, today)) return;
      const key = toYMD(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [entries, today]);

  const dayStats = useMemo(() => {
    const result: {
      [key: string]: {
        hizbCount: number;
        hizbNumbers: number[];
      };
    } = {};

    weekDays.forEach((d) => {
      const key = toYMD(d);
      const dayEntries = entriesByDay.get(key) || [];
      const hizbEntries = dayEntries.filter((e) => e.type === "hizb");
      result[key] = {
        hizbCount: hizbEntries.length,
        hizbNumbers: hizbEntries
          .map((e) => e.hizbNumber ?? 0)
          .filter((n) => n > 0)
          .sort((a, b) => a - b),
      };
    });

    return result;
  }, [weekDays, entriesByDay]);

  const selectedDayEntries =
    selectedDayKey && entriesByDay.get(selectedDayKey) ? entriesByDay.get(selectedDayKey)! : [];

  const badges = useMemo(() => {
    const list: string[] = [];
    if (weekHizbCount >= 28) list.push("Istiqama semaine (≥ 4 hizb/jour en moyenne)");
    if (monthHizbCount >= 60) list.push("Khatm complet ce mois");
    return list;
  }, [weekHizbCount, monthHizbCount]);

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Quran Tracker</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {todayLabel || "Chargement de la date..."}
      </p>

      {/* Objectif & Jauge semaine */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Objectif : 4 Hizb / jour</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>
          Semaine du {weekLabel || "..."}
        </p>
        <div
          style={{
            background: "#edf2f7",
            borderRadius: "999px",
            overflow: "hidden",
            height: "10px",
            marginBottom: "0.35rem",
          }}
        >
          <div
            style={{
              width: `${percentWeek}%`,
              background: "linear-gradient(90deg, #7b6fe6, #00f5ff)",
              height: "100%",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "0.9rem" }}>
          {weekHizbCount} hizb validés cette semaine • {percentWeek}% de l&apos;objectif
        </p>
        {weekHizbNumbers.length > 0 && (
          <p style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#555" }}>
            Hizb lus cette semaine : {weekHizbNumbers.sort((a, b) => a - b).join(", ")}
          </p>
        )}
      </section>

      {/* Récap jour par jour */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Cette semaine, jour par jour</h2>
        <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: "0.5rem" }}>
          Objectif : {HIZB_PER_DAY_TARGET} hizb / jour. Appuie sur un jour pour voir le détail.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "0.3rem",
          }}
        >
          {weekDays.map((d) => {
            const key = toYMD(d);
            const stats = dayStats[key];
            const hizbCount = stats?.hizbCount ?? 0;
            const reached = hizbCount >= HIZB_PER_DAY_TARGET;
            const isToday = today && toYMD(today) === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDayKey(key)}
                style={{
                  borderRadius: "0.75rem",
                  padding: "0.25rem 0.15rem",
                  border: "none",
                  cursor: "pointer",
                  background: reached ? "linear-gradient(145deg, #16a34a, #4ade80)" : "#f3f4f6",
                  color: reached ? "#ffffff" : "#111827",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  boxShadow: isToday
                    ? "0 0 0 2px rgba(0,245,255,0.8)"
                    : "0 1px 3px rgba(15,23,42,0.15)",
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {d.toLocaleDateString("fr-FR", {
                    weekday: "short",
                  })}
                </span>
                <span>
                  {d.getDate().toString().padStart(2, "0")}/
                  {(d.getMonth() + 1).toString().padStart(2, "0")}
                </span>
                <span style={{ marginTop: "0.1rem", fontWeight: 600 }}>
                  {hizbCount}/{HIZB_PER_DAY_TARGET}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hizb */}
      <section className="list-item">
        <h2>Hizb lus</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>
          Total {currentYear ?? "..."} : <strong>{yearHizbCount}</strong> hizb
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginTop: "0.3rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="number"
            className="input"
            style={{ maxWidth: "140px", margin: 0 }}
            value={hizbNumber}
            onChange={(e) => setHizbNumber(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="N° hizb"
          />
          {editingType === "hizb" && editingId ? (
            <>
              <button className="btn" onClick={saveEdit}>
                💾 Enregistrer
              </button>
              <button
                className="btn"
                style={{ background: "#808d8e" }}
                onClick={() => {
                  setEditingId(null);
                  setEditingType(null);
                  setHizbNumber("");
                }}
              >
                Annuler
              </button>
            </>
          ) : (
            <button className="btn" onClick={addHizb} disabled={!isReady}>
              ✓ Valider hizb
            </button>
          )}
        </div>

        <p style={{ fontSize: "0.85rem", marginTop: "0.4rem", color: "#777" }}>
          Exemple : saisir 4 si tu as lu le hizb n°4.
        </p>
      </section>

      {/* Sourates */}
      <section className="list-item" style={{ marginTop: "1rem" }}>
        <h2>Sourates & répétitions</h2>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginTop: "0.3rem",
          }}
        >
          <input
            className="input"
            style={{ flex: "1 1 160px", minWidth: "120px", margin: 0 }}
            value={sourateName}
            onChange={(e) => setSourateName(e.target.value)}
            placeholder="Nom de la sourate"
          />
          <input
            type="number"
            className="input"
            style={{ width: "110px", margin: 0 }}
            value={repetitions}
            onChange={(e) => setRepetitions(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Répét."
          />
        </div>
        <div style={{ marginTop: "0.45rem" }}>
          {editingType === "sourate" && editingId ? (
            <>
              <button className="btn" onClick={saveEdit}>
                💾 Enregistrer
              </button>
              <button
                className="btn"
                style={{ marginLeft: "0.4rem", background: "#808d8e" }}
                onClick={() => {
                  setEditingId(null);
                  setEditingType(null);
                  setSourateName("");
                  setRepetitions("");
                }}
              >
                Annuler
              </button>
            </>
          ) : (
            <button className="btn" onClick={addSourate} disabled={!isReady}>
              + Ajouter sourate
            </button>
          )}
        </div>
      </section>

      {/* Statistiques simples */}
      <section className="list-item" style={{ marginTop: "1rem" }}>
        <h2>Statistiques</h2>
        <p style={{ fontSize: "0.9rem" }}>
          Semaine : {weekHizbCount} hizb • Mois : {monthHizbCount} hizb
        </p>
        <p style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>
          Mois actuel : {monthLabel || "..."}
        </p>
      </section>

      {/* Récap semaine (texte) */}
      <section className="list-item" style={{ marginTop: "1.1rem" }}>
        <h2>Récap semaine (lundi → dimanche)</h2>
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

      {/* Historique semaine en cours */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Historique (semaine en cours)</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem", color: "#777" }}>
          Modifie ou supprime en cas d&apos;erreur. Les anciennes semaines restent en mémoire mais
          ne sont pas affichées ici.
        </p>

        {entries.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>Aucune entrée enregistrée.</p>
        )}

        {today &&
          (() => {
            const currentWeekEntries = entries.filter((e) => isSameWeek(new Date(e.date), today));

            if (currentWeekEntries.length === 0) return null;

            return (
              <div className="list-item" style={{ marginTop: "0.5rem" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Semaine du {weekLabel || "..."}
                </p>

                {currentWeekEntries.map((e) => {
                  const d = new Date(e.date);
                  return (
                    <div
                      key={e.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.25rem 0",
                        borderTop: "1px solid #e5e7eb",
                        marginTop: "0.15rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 500,
                            fontSize: "0.9rem",
                          }}
                        >
                          {e.type === "hizb"
                            ? `Hizb n°${e.hizbNumber}`
                            : `${e.sourateName} × ${e.repetitions}`}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: "#666",
                          }}
                        >
                          {d.toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <button
                          className="btn"
                          style={{
                            paddingInline: "0.6rem",
                            fontSize: "0.8rem",
                            marginRight: "0.2rem",
                          }}
                          onClick={() =>
                            e.type === "hizb" ? startEditHizb(e) : startEditSourate(e)
                          }
                        >
                          ✏️
                        </button>
                        <button
                          className="btn"
                          style={{
                            paddingInline: "0.6rem",
                            fontSize: "0.8rem",
                            background: "#e02424",
                          }}
                          onClick={() => deleteEntry(e.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
      </section>

      {/* Objectif khatam */}
      <section className="list-item" style={{ marginBottom: "1rem", marginTop: "1.5rem" }}>
        <h2>Objectif khatam</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="date"
            className="input"
            value={khatmTargetDate}
            onChange={(e) => setKhatmTargetDate(e.target.value)}
          />
        </div>
        {khatmStats && (
          <p style={{ fontSize: "0.9rem", marginTop: "0.4rem" }}>
            Il te reste <strong>{khatmStats.daysLeft}</strong> jours, il faut environ{" "}
            <strong>{khatmStats.hizbPerDayNeeded}</strong> hizb / jour.
          </p>
        )}
      </section>

      {/* Comparatif semaine / mois précédents */}
      <section className="list-item" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <h2>Comparatif</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>
          Comparaison des hizb validés avec la période précédente.
        </p>

        <div style={{ fontSize: "0.9rem" }}>
          <p style={{ marginBottom: "0.25rem" }}>
            Semaine actuelle : <strong>{weekHizbCount}</strong> hizb
            <br />
            Semaine précédente : <strong>{prevWeekHizbCount}</strong> hizb
          </p>
          <p
            style={{
              color: weekDiff > 0 ? "#15803d" : weekDiff < 0 ? "#b91c1c" : "#4b5563",
              marginBottom: "0.6rem",
            }}
          >
            Évolution : {weekDiff > 0 ? "+" : ""}
            {weekDiff}%
          </p>

          <p style={{ marginBottom: "0.25rem" }}>
            Mois actuel : <strong>{monthHizbCount}</strong> hizb
            <br />
            Mois précédent : <strong>{prevMonthHizbCount}</strong> hizb
          </p>
          <p
            style={{
              color: monthDiff > 0 ? "#15803d" : monthDiff < 0 ? "#b91c1c" : "#4b5563",
            }}
          >
            Évolution : {monthDiff > 0 ? "+" : ""}
            {monthDiff}%
          </p>
        </div>
      </section>

      {/* Vue mensuelle (mini heatmap compacte corrigée) */}
      <section className="list-item" style={{ marginTop: "1.5rem" }}>
        <h2>Vue mensuelle</h2>
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

            const hizbByDay = new Map<number, number>();
            entries.forEach((e) => {
              if (e.type !== "hizb") return;
              const d = new Date(e.date);
              if (!isSameMonth(d, monthStart)) return;
              const day = d.getDate();
              hizbByDay.set(day, (hizbByDay.get(day) || 0) + 1);
            });

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
                    const jsDay = date.getDay(); // 0 = dimanche
                    const offset = (jsDay + 6) % 7; // 0 = lundi

                    const isFirstOfMonth = dayNumber === 1;
                    const blanks =
                      isFirstOfMonth && offset > 0
                        ? Array.from({ length: offset }).map((__, idx) => (
                            <div key={`blank-${dayNumber}-${idx}`} style={{ minHeight: "18px" }} />
                          ))
                        : [];

                    const count = hizbByDay.get(dayNumber) || 0;
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

      {/* Badges */}
      <section className="list-item" style={{ marginTop: "1rem" }}>
        <h2>Badges</h2>
        {badges.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>
            Continue à lire pour débloquer des badges.
          </p>
        )}
        {badges.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {badges.map((b) => (
              <li
                key={b}
                style={{
                  fontSize: "0.9rem",
                  padding: "0.35rem 0.5rem",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, var(--neon-purple), var(--neon-blue))",
                  color: "#fff",
                  marginBottom: "0.3rem",
                }}
              >
                {b}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal récap jour */}
      {selectedDayKey && (
        <div
          onClick={() => setSelectedDayKey(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.45)",
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
              background: "#ffffff",
              borderRadius: "1.25rem 1.25rem 0 0",
              padding: "1rem 1rem 1.25rem",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 -10px 25px rgba(15,23,42,0.35)",
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
                Détail de la journée
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

            {(() => {
              const dayDate = new Date(selectedDayKey);
              const label = dayDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              });
              const stats = dayStats[selectedDayKey] || {
                hizbCount: 0,
                hizbNumbers: [],
              };

              return (
                <>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#4b5563",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.6rem" }}>
                    Hizb lus :{" "}
                    <strong>
                      {stats.hizbCount}/{HIZB_PER_DAY_TARGET}
                    </strong>
                    {stats.hizbNumbers.length > 0 && <> • Hizb : {stats.hizbNumbers.join(", ")}</>}
                  </p>
                </>
              );
            })()}

            {selectedDayEntries.length === 0 && (
              <p style={{ fontSize: "0.9rem", color: "#777" }}>
                Aucun hizb ou sourate enregistré pour cette journée.
              </p>
            )}

            {selectedDayEntries.length > 0 && (
              <div>
                {selectedDayEntries.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: "0.4rem 0",
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        {e.type === "hizb"
                          ? `Hizb n°${e.hizbNumber}`
                          : `${e.sourateName} × ${e.repetitions}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
    </main>
  );
}
