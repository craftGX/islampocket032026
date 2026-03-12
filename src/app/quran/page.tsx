"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type QuranEntry = {
  id: string;
  date: string; // ISO
  type: "hizb" | "sourate";
  hizbNumber?: number;
  sourateName?: string;
  repetitions?: number;
};

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0=dimanche, 1=lundi...
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

export default function QuranTracker() {
  const [entries, setEntries] = useState<QuranEntry[]>([]);
  const [hizbNumber, setHizbNumber] = useState<number | "">("");
  const [sourateName, setSourateName] = useState("");
  const [repetitions, setRepetitions] = useState<number | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"hizb" | "sourate" | null>(null);

  const today = new Date();
  const todayISO = today.toISOString();
  const weekStart = startOfWeekMonday(today);
  const monthStart = startOfMonth(today);
  const currentYear = today.getFullYear();

  // LOAD
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

  // SAVE
  useEffect(() => {
    localStorage.setItem("quranEntries", JSON.stringify(entries));
  }, [entries]);

  // --- Ajout / édition ---

  const addHizb = () => {
    if (hizbNumber === "" || Number(hizbNumber) <= 0) return;
    const entry: QuranEntry = {
      id: crypto.randomUUID(),
      date: todayISO,
      type: "hizb",
      hizbNumber: Number(hizbNumber),
    };
    setEntries((prev) => [entry, ...prev]);
    setHizbNumber("");
  };

  const addSourate = () => {
    if (!sourateName.trim() || repetitions === "" || Number(repetitions) <= 0) return;
    const entry: QuranEntry = {
      id: crypto.randomUUID(),
      date: todayISO,
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

  // --- Stats principales + semaine/mois précédents ---

  const {
    weekHizbCount,
    monthHizbCount,
    yearHizbCount,
    weekHizbNumbers,
    weekSouratesMap,
    prevWeekHizbCount,
    prevMonthHizbCount,
  } = useMemo(() => {
    let weekHizbCount = 0;
    let monthHizbCount = 0;
    let yearHizbCount = 0;

    let prevWeekHizbCount = 0;
    let prevMonthHizbCount = 0;

    const weekHizbNumbers: number[] = [];
    const weekSouratesMap = new Map<string, { repetitions: number; weekKey: string }>();

    const prevWeekStart = new Date(startOfWeekMonday(today));
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
  }, [entries, currentYear, today, monthStart]);
  // [web:77][web:79][web:81]

  const hizbPerDayTarget = 4;
  const daysSinceWeekStart =
    1 + Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  const targetWeek = hizbPerDayTarget * daysSinceWeekStart;
  const percentWeek =
    targetWeek > 0 ? Math.min(100, Math.round((weekHizbCount / targetWeek) * 100)) : 0;

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
  // [web:85]

  // Libellés
  const weekLabel = `${weekStart.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  })} ➜ ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  })}`;

  const todayLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const monthLabel = today.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const weekSouratesList = Array.from(weekSouratesMap.entries()).map(([key, value]) => {
    const [name] = key.split("-");
    return { name, repetitions: value.repetitions };
  });

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Quran Tracker</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>{todayLabel}</p>

      {/* Objectif & Jauge */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Objectif : 4 Hizb / jour</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>Semaine du {weekLabel}</p>
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
              background: "linear-gradient(90deg, #947eb0, #a9d2d5)",
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

      {/* Hizb */}
      <section className="list-item">
        <h2>Hizb lus</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>
          Total {currentYear} : <strong>{yearHizbCount}</strong> hizb
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
            <button className="btn" onClick={addHizb}>
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
            <button className="btn" onClick={addSourate}>
              + Ajouter sourate
            </button>
          )}
        </div>
      </section>

      {/* Stats simples */}
      <section className="list-item" style={{ marginTop: "1rem" }}>
        <h2>Statistiques</h2>
        <p style={{ fontSize: "0.9rem" }}>
          Semaine : {weekHizbCount} hizb • Mois : {monthHizbCount} hizb
        </p>
        <p style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>Mois actuel : {monthLabel}</p>
      </section>

      {/* Récap semaine */}
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

      {/* Historique par semaine avec edit/suppression */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Historique par semaine</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem", color: "#777" }}>
          Modifie ou supprime en cas d&apos;erreur.
        </p>

        {entries.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>Aucune entrée enregistrée.</p>
        )}

        {(() => {
          const byWeek = new Map<
            string,
            {
              start: Date;
              end: Date;
              entries: QuranEntry[];
            }
          >();

          entries.forEach((e) => {
            const d = new Date(e.date);
            const weekStartDate = startOfWeekMonday(d);
            const weekKey = weekStartDate.toISOString();
            const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

            if (!byWeek.has(weekKey)) {
              byWeek.set(weekKey, {
                start: weekStartDate,
                end: weekEndDate,
                entries: [],
              });
            }
            byWeek.get(weekKey)!.entries.push(e);
          });

          const weeks = Array.from(byWeek.entries()).sort(
            (a, b) => b[1].start.getTime() - a[1].start.getTime(),
          );

          if (weeks.length === 0) return null;

          return weeks.slice(0, 6).map(([key, w]) => (
            <div key={key} className="list-item" style={{ marginTop: "0.5rem" }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginBottom: "0.25rem",
                }}
              >
                Semaine du{" "}
                {w.start.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })}{" "}
                au{" "}
                {w.end.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>

              {w.entries.length === 0 && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#777",
                    marginTop: "0.2rem",
                  }}
                >
                  Aucune donnée pour cette semaine.
                </p>
              )}

              {w.entries.map((e) => {
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
                        onClick={() => deleteEntry(e.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ));
        })()}
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
    </main>
  );
}
