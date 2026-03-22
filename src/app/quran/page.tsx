"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

type QuranEntry = {
  id: string;
  date: string; // YYYY-MM-DD local
  type: "hizb" | "sourate";
  hizbNumber?: number;
  sourateName?: string;
  repetitions?: number;
};

function startOfWeekMonday(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const HIZB_PER_DAY_TARGET = 4;

export default function QuranTracker() {
  const [entries, setEntries] = useState<QuranEntry[]>([]);

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

  // modal confirmation suppression
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>("");

  useEffect(() => {
    const t = new Date();
    const localToday = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const ws = startOfWeekMonday(localToday);
    const ms = startOfMonth(localToday);
    setToday(localToday);
    setWeekStart(ws);
    setMonthStart(ms);
    setCurrentYear(localToday.getFullYear());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("quranEntries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("quranEntries", JSON.stringify(entries));
  }, [entries]);

  const addHizb = () => {
    if (!today || hizbNumber === "" || Number(hizbNumber) <= 0) {
      toast.error("Merci d’indiquer un numéro de hizb valide.");
      return;
    }

    const entry: QuranEntry = {
      id: crypto.randomUUID(),
      date: toYMD(today),
      type: "hizb",
      hizbNumber: Number(hizbNumber),
    };

    setEntries((prev) => [entry, ...prev]);
    setHizbNumber("");
    toast.success("Hizb enregistré ✅");
  };

  const addSourate = () => {
    if (!today) return;
    if (!sourateName.trim() || repetitions === "" || Number(repetitions) <= 0) {
      toast.error("Merci de remplir le nom et le nombre de répétitions.");
      return;
    }

    const normalizedName = sourateName.trim().toLowerCase(); // casse gérée ici

    const entry: QuranEntry = {
      id: crypto.randomUUID(),
      date: toYMD(today),
      type: "sourate",
      sourateName: normalizedName,
      repetitions: Number(repetitions),
    };

    setEntries((prev) => [entry, ...prev]);
    setSourateName("");
    setRepetitions("");
    toast.success("Sourate enregistrée ✅");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingType(null);
    }
    toast.success("Entrée supprimée.");
  };

  const askDeleteEntry = (entry: QuranEntry) => {
    const d = new Date(entry.date + "T00:00:00");
    const dateLabel = d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    const label =
      entry.type === "hizb"
        ? `Hizb n°${entry.hizbNumber} (${dateLabel})`
        : `${entry.sourateName} × ${entry.repetitions} (${dateLabel})`;

    setConfirmDeleteId(entry.id);
    setConfirmDeleteLabel(label);
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

    let updated = false;

    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== editingId) return e;

        if (editingType === "hizb") {
          if (hizbNumber === "" || Number(hizbNumber) <= 0) return e;
          updated = true;
          return { ...e, hizbNumber: Number(hizbNumber) };
        }

        if (!sourateName.trim() || repetitions === "" || Number(repetitions) <= 0) return e;

        const normalizedName = sourateName.trim().toLowerCase();

        updated = true;
        return {
          ...e,
          sourateName: normalizedName,
          repetitions: Number(repetitions),
        };
      }),
    );

    if (updated) {
      toast.success("Modification enregistrée ✅");
    } else {
      toast.error("Impossible d’enregistrer la modification.");
    }

    setEditingId(null);
    setEditingType(null);
    setHizbNumber("");
    setSourateName("");
    setRepetitions("");
  };

  const { weekHizbCount, monthHizbCount, yearHizbCount } = useMemo(() => {
    if (!today || !currentYear || !weekStart || !monthStart) {
      return {
        weekHizbCount: 0,
        monthHizbCount: 0,
        yearHizbCount: 0,
      };
    }

    let weekHizbCount = 0;
    let monthHizbCount = 0;
    let yearHizbCount = 0;

    entries.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      const inYear = d.getFullYear() === currentYear;
      const inWeek = isSameWeek(d, today);
      const inMonth = isSameMonth(d, today);

      if (e.type === "hizb") {
        if (inWeek) weekHizbCount += 1;
        if (inMonth) monthHizbCount += 1;
        if (inYear) yearHizbCount += 1;
      }
    });

    return {
      weekHizbCount,
      monthHizbCount,
      yearHizbCount,
    };
  }, [entries, currentYear, today, weekStart, monthStart]);

  const percentWeek = useMemo(() => {
    if (!today || !weekStart) return 0;

    const daysSinceWeekStart =
      1 + Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

    const targetWeek = HIZB_PER_DAY_TARGET * daysSinceWeekStart;

    return targetWeek > 0 ? Math.min(100, Math.round((weekHizbCount / targetWeek) * 100)) : 0;
  }, [today, weekStart, weekHizbCount]);

  const todayLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const weekLabel =
    weekStart &&
    `${weekStart.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    })} ➜ ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    })}`;

  const isReady = !!today && !!weekStart && !!monthStart && currentYear !== null;

  const entriesByDay = useMemo(() => {
    const map = new Map<string, QuranEntry[]>();
    if (!today) return map;
    entries.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      if (!isSameWeek(d, today)) return;
      const key = e.date; // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [entries, today]);

  const weekDays = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      return d;
    });
  }, [weekStart]);

  const dayStats = useMemo(() => {
    const result: {
      [key: string]: {
        hizbCount: number;
        hizbNumbers: number[];
        sourateCount: number;
        sourateNames: { name: string; repetitions: number }[];
      };
    } = {};

    weekDays.forEach((d) => {
      const key = toYMD(d);
      const dayEntries = entriesByDay.get(key) || [];
      const hizbEntries = dayEntries.filter((e) => e.type === "hizb");
      const sourateEntries = dayEntries.filter((e) => e.type === "sourate");

      result[key] = {
        hizbCount: hizbEntries.length,
        hizbNumbers: hizbEntries
          .map((e) => e.hizbNumber ?? 0)
          .filter((n) => n > 0)
          .sort((a, b) => a - b),
        sourateCount: sourateEntries.length,
        sourateNames: sourateEntries
          .filter((e) => e.sourateName && e.repetitions != null)
          .map((e) => ({
            name: e.sourateName as string,
            repetitions: e.repetitions as number,
          })),
      };
    });

    return result;
  }, [weekDays, entriesByDay]);

  const selectedDayEntries =
    selectedDayKey && entriesByDay.get(selectedDayKey) ? entriesByDay.get(selectedDayKey)! : [];

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Quran Tracker
      </motion.h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {todayLabel || "Chargement de la date..."}
      </p>

      <motion.section
        className="list-item"
        style={{ marginBottom: "1rem" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>Progression hebdomadaire</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
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
        <p style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#555" }}>
          Total {currentYear ?? "..."} : <strong>{yearHizbCount}</strong> hizb
        </p>
      </motion.section>

      {/* Saisie hizb */}
      <section className="list-item">
        <h2>Ajouter un hizb lu</h2>
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
        <h2>Sourates travaillées</h2>
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

      {/* Historique semaine actuelle rapide (fusion par jour + sourates fusionnées) */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Historique rapide (semaine)</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem", color: "#777" }}>
          Le détail complet est dans la page Récap globale.
        </p>

        {today &&
          (() => {
            const currentWeekEntries = entries.filter((e) =>
              isSameWeek(new Date(e.date + "T00:00:00"), today),
            );

            if (currentWeekEntries.length === 0) {
              return (
                <p style={{ fontSize: "0.9rem", color: "#777" }}>
                  Aucune entrée enregistrée cette semaine.
                </p>
              );
            }

            // groupage par jour + fusion des sourates
            const groupedByDay = new Map<
              string,
              {
                date: Date;
                hizb: QuranEntry[];
                souratesMerged: { name: string; totalRepetitions: number }[];
              }
            >();

            currentWeekEntries.forEach((e) => {
              const d = new Date(e.date + "T00:00:00");
              const key = e.date;

              if (!groupedByDay.has(key)) {
                groupedByDay.set(key, {
                  date: d,
                  hizb: [],
                  souratesMerged: [],
                });
              }

              const group = groupedByDay.get(key)!;

              if (e.type === "hizb") {
                group.hizb.push(e);
              } else if (e.type === "sourate" && e.sourateName && e.repetitions != null) {
                const map = new Map<string, number>();
                group.souratesMerged.forEach((s) => {
                  map.set(s.name, s.totalRepetitions);
                });
                const nameKey = e.sourateName.trim().toLowerCase();
                map.set(nameKey, (map.get(nameKey) || 0) + e.repetitions);
                group.souratesMerged = Array.from(map.entries()).map(
                  ([name, totalRepetitions]) => ({
                    name,
                    totalRepetitions,
                  }),
                );
              }
            });

            const groupedDays = Array.from(groupedByDay.values()).sort(
              (a, b) => b.date.getTime() - a.date.getTime(),
            );

            return (
              <div className="list-item" style={{ marginTop: "0.5rem" }}>
                {groupedDays.map((day) => (
                  <div
                    key={toYMD(day.date)}
                    style={{
                      padding: "0.4rem 0",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {day.date.toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>

                    {day.hizb.length > 0 && (
                      <p style={{ margin: "0.15rem 0", fontSize: "0.85rem" }}>
                        Hizb :{" "}
                        {day.hizb
                          .map((h) => (h.hizbNumber ? `n°${h.hizbNumber}` : ""))
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {day.souratesMerged.length > 0 && (
                      <p style={{ margin: "0.15rem 0", fontSize: "0.85rem" }}>
                        Sourates :{" "}
                        {day.souratesMerged
                          .map((s) => `${s.name} × ${s.totalRepetitions}`)
                          .join(" | ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
      </section>

      {/* Modal jour (détail déjà existant) */}
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
              const dayDate = new Date(selectedDayKey + "T00:00:00");
              const label = dayDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              });
              const stats = dayStats[selectedDayKey] || {
                hizbCount: 0,
                hizbNumbers: [],
                sourateCount: 0,
                sourateNames: [],
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
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                    Hizb lus : <strong>{stats.hizbCount}</strong>
                    {stats.hizbNumbers.length > 0 && <> • Hizb : {stats.hizbNumbers.join(", ")}</>}
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.6rem" }}>
                    Sourates travaillées : <strong>{stats.sourateCount}</strong>
                    {stats.sourateNames.length > 0 && (
                      <>
                        {" "}
                        •{" "}
                        {stats.sourateNames.map((s) => `${s.name} × ${s.repetitions}`).join(" | ")}
                      </>
                    )}
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
                    <div>
                      <button
                        className="btn"
                        style={{
                          paddingInline: "0.6rem",
                          fontSize: "0.8rem",
                          marginRight: "0.2rem",
                        }}
                        onClick={() => (e.type === "hizb" ? startEditHizb(e) : startEditSourate(e))}
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
                        onClick={() => askDeleteEntry(e)}
                      >
                        🗑
                      </button>
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

      <section style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <Link href="/recap" className="btn">
          Voir le récap global
        </Link>
      </section>

      {/* Modal confirmation suppression */}
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.75rem",
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#ffffff",
              borderRadius: "1rem",
              padding: "1rem 1.1rem 1.1rem",
              boxShadow: "0 15px 35px rgba(15,23,42,0.45)",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Confirmer la suppression
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "0.75rem" }}>
              Veux-tu vraiment supprimer cette entrée ?
              <br />
              <strong>{confirmDeleteLabel}</strong>
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.25rem",
              }}
            >
              <button
                type="button"
                className="btn"
                style={{ background: "#e5e7eb", color: "#111827" }}
                onClick={() => setConfirmDeleteId(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: "#ef4444" }}
                onClick={() => {
                  if (confirmDeleteId) {
                    deleteEntry(confirmDeleteId);
                  }
                  setConfirmDeleteId(null);
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
