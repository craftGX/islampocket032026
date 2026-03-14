"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DayCount = {
  date: string; // 'YYYY-MM-DD'
  count: number;
};

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

// renvoie le dernier vendredi (passé)
function getLastFriday(today: Date) {
  const d = new Date(today);
  const day = d.getDay(); // 0=dim, 5=ven
  const diff = (day + 1 + 7 - 5) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// début de la semaine (lundi)
function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0=dim, 1=lun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameWeek(a: Date, b: Date) {
  return startOfWeekMonday(a).getTime() === startOfWeekMonday(b).getTime();
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// helpers localStorage safe pour Next
function safeGetItem(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function PrieresPage() {
  // ---------- HOOKS (ordre fixe) ----------

  // on sait si le client a hydraté
  const [hydrated, setHydrated] = useState(false);

  // état principal, initialisé depuis localStorage de manière lazy
  const [days, setDays] = useState<DayCount[]>(() => {
    const saved = safeGetItem("prieresByDay");
    if (!saved) return [];
    try {
      return JSON.parse(saved) as DayCount[];
    } catch {
      return [];
    }
  });

  const [today, setToday] = useState<Date | null>(null);
  const [todayKey, setTodayKey] = useState<string>("");
  const [lastFriday, setLastFriday] = useState<Date | null>(null);
  const [lastFridayKey, setLastFridayKey] = useState<string>("");

  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    const saved = safeGetItem("prieresDailyTarget");
    if (!saved) return 100;
    const n = Number(saved);
    return !Number.isNaN(n) && n > 0 ? n : 100;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = safeGetItem("prieresStreak");
    if (!saved) return 0;
    const n = Number(saved);
    return !Number.isNaN(n) && n >= 0 ? n : 0;
  });

  const [todayCount, setTodayCount] = useState(0);

  // useEffect: marquer l’hydratation et initialiser les dates + todayCount
  useEffect(() => {
    setHydrated(true);

    const t = new Date();
    const k = formatDateISO(t);
    const lf = getLastFriday(t);
    const lfKey = formatDateISO(lf);

    setToday(t);
    setTodayKey(k);
    setLastFriday(lf);
    setLastFridayKey(lfKey);

    const saved = safeGetItem("prieresByDay");
    if (saved) {
      try {
        const parsed: DayCount[] = JSON.parse(saved);
        const todayRow = parsed.find((d) => d.date === k);
        setTodayCount(todayRow ? todayRow.count : 0);
      } catch {
        setTodayCount(0);
      }
    }
  }, []);

  // persistance jours
  useEffect(() => {
    if (!hydrated) return;
    safeSetItem("prieresByDay", JSON.stringify(days));
  }, [days, hydrated]);

  // persistance objectif
  useEffect(() => {
    if (!hydrated) return;
    safeSetItem("prieresDailyTarget", String(dailyTarget));
  }, [dailyTarget, hydrated]);

  // persistance streak
  useEffect(() => {
    if (!hydrated) return;
    safeSetItem("prieresStreak", String(streak));
  }, [streak, hydrated]);

  // recalcul du streak à partir de l'historique
  useEffect(() => {
    if (!hydrated) return;
    if (!today || !todayKey) return;
    if (dailyTarget <= 0) {
      setStreak(0);
      return;
    }

    const reachedSet = new Set<string>();
    days.forEach((d) => {
      if (d.count >= dailyTarget) reachedSet.add(d.date);
    });

    let currentStreak = 0;
    const cursor = new Date(today);
    while (true) {
      const key = formatDateISO(cursor);
      if (!reachedSet.has(key)) break;
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    setStreak(currentStreak);
  }, [days, today, todayKey, dailyTarget, hydrated]);

  // useMemo calculs dérivés (toujours appelés, mais retournent du neutre si pas prêt)
  const totalAllTime = useMemo(() => days.reduce((sum, d) => sum + d.count, 0), [days]);

  const lastFridayCount = useMemo(() => {
    if (!lastFridayKey) return 0;
    return days.find((d) => d.date === lastFridayKey)?.count ?? 0;
  }, [days, lastFridayKey]);

  const comparePercent = useMemo(() => {
    if (!hydrated) return 0;
    if (lastFridayCount === 0) {
      return todayCount > 0 ? 100 : 0;
    }
    return Math.round(((todayCount - lastFridayCount) / lastFridayCount) * 100);
  }, [todayCount, lastFridayCount, hydrated]);

  const sortedDays = useMemo(
    () => [...days].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [days],
  );

  const todayLabel = useMemo(() => {
    if (!today) return "";
    return today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [today]);

  const lastFridayLabel = useMemo(() => {
    if (!lastFriday) return "";
    return lastFriday.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [lastFriday]);

  const { weekCount, monthCount } = useMemo(() => {
    if (!today) return { weekCount: 0, monthCount: 0 };
    let wc = 0;
    let mc = 0;
    days.forEach((d) => {
      const date = new Date(d.date);
      if (isSameWeek(date, today)) wc += d.count;
      if (isSameMonth(date, today)) mc += d.count;
    });
    return { weekCount: wc, monthCount: mc };
  }, [days, today]);

  const progressToday =
    dailyTarget > 0 ? Math.min(100, Math.round((todayCount / dailyTarget) * 100)) : 0;

  const isReady = hydrated && !!today && !!todayKey && !!lastFriday && !!lastFridayKey;

  // ---------- handlers ----------

  const incrementToday = () => {
    if (!todayKey) return;
    setDays((prev) => {
      const existing = prev.find((d) => d.date === todayKey);
      if (existing) {
        const next = prev.map((d) => (d.date === todayKey ? { ...d, count: d.count + 1 } : d));
        safeSetItem("prieresByDay", JSON.stringify(next));
        return next;
      } else {
        const next = [...prev, { date: todayKey, count: 1 }];
        safeSetItem("prieresByDay", JSON.stringify(next));
        return next;
      }
    });
    setTodayCount((c) => c + 1);
  };

  const editDayCount = (date: string) => {
    const current = days.find((d) => d.date === date);
    if (!current) return;
    const input = prompt(`Nouveau nombre de prières pour le ${date} :`, String(current.count));
    if (input === null) return;
    const value = Number(input);
    if (Number.isNaN(value) || value < 0) return;

    setDays((prev) => {
      const next = prev.map((d) => (d.date === date ? { ...d, count: value } : d));
      safeSetItem("prieresByDay", JSON.stringify(next));
      return next;
    });
    if (date === todayKey) {
      setTodayCount(value);
    }
  };

  const deleteDay = (date: string) => {
    const ok = confirm(`Supprimer les prières enregistrées pour le ${date} ?`);
    if (!ok) return;
    setDays((prev) => {
      const next = prev.filter((d) => d.date !== date);
      safeSetItem("prieresByDay", JSON.stringify(next));
      return next;
    });
    if (date === todayKey) {
      setTodayCount(0);
    }
  };

  // ---------- rendu ----------

  return (
    <main className="app-container">
      <Link href="/" className="btn btn-secondary">
        ← Accueil
      </Link>

      <h1>Prières sur le Prophète ﷺ</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {hydrated ? todayLabel || "Chargement de la date..." : "Chargement de la date..."}
      </p>

      {/* Objectif journalier + streak */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Objectif & série</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Objectif du jour : <strong>{dailyTarget}</strong> prières sur le Prophète ﷺ
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="number"
            className="input"
            style={{ maxWidth: "120px", margin: 0 }}
            value={dailyTarget}
            onChange={(e) =>
              setDailyTarget(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))
            }
            placeholder="Objectif"
          />
          <span style={{ fontSize: "0.9rem", color: "#4b5563" }}>
            Série actuelle : <strong>{streak}</strong> jour
            {streak > 1 ? "s" : ""} d&apos;objectif atteint
          </span>
        </div>
      </section>

      {/* Bouton principal + recap jour */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Compteur du jour</h2>
        <div className="counter">{hydrated ? todayCount : 0} prières aujourd&apos;hui</div>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          Clique sur le bouton à chaque fois que tu fais une prière sur le Prophète ﷺ.
        </p>

        {/* barre de progression */}
        <div
          style={{
            marginTop: "0.2rem",
            marginBottom: "0.4rem",
          }}
        >
          <div
            style={{
              background: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
              height: "8px",
            }}
          >
            <div
              style={{
                width: `${hydrated ? progressToday : 0}%`,
                background: "linear-gradient(90deg, rgba(56,189,248,1), rgba(129,140,248,1))",
                height: "100%",
                transition: "width 0.2s ease-out",
              }}
            />
          </div>
          <p
            style={{
              marginTop: "0.25rem",
              fontSize: "0.8rem",
              color: "#6b7280",
            }}
          >
            {hydrated ? progressToday : 0}% de ton objectif d&apos;aujourd&apos;hui
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <button
            onClick={incrementToday}
            disabled={!isReady}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "999px",
              border: "none",
              background: "radial-gradient(circle at 30% 20%, #ffffff, #947eb0 60%, #7e67a1)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "1.1rem",
              boxShadow: "0 18px 35px rgba(148, 126, 176, 0.45)",
              cursor: isReady ? "pointer" : "not-allowed",
              opacity: isReady ? 1 : 0.6,
              transition:
                "transform 0.08s ease-out, box-shadow 0.08s ease-out, filter 0.08s ease-out",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
            }}
          >
            +1
          </button>
        </div>
      </section>

      {/* Récap global + semaine / mois */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Récap global</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Total depuis le début : <strong>{totalAllTime}</strong> prières
        </p>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Cette semaine : <strong>{weekCount}</strong> prières
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Ce mois-ci : <strong>{monthCount}</strong> prières
        </p>
        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Dernier vendredi ({hydrated ? lastFridayLabel || "..." : "..."}):{" "}
          <strong>{lastFridayCount}</strong> prières
        </p>
      </section>

      {/* Comparatif vs vendredi dernier */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Comparatif avec vendredi dernier</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>
          Aujourd&apos;hui : <strong>{todayCount}</strong> prières
          <br />
          Vendredi dernier : <strong>{lastFridayCount}</strong> prières
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

      {/* Historique par jour */}
      <section className="list-item" style={{ marginBottom: "1.5rem" }}>
        <h2>Historique par jour</h2>
        {sortedDays.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>
            Aucune prière enregistrée pour l&apos;instant.
          </p>
        )}

        {sortedDays.map((d) => {
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
                gap: "0.5rem",
              }}
            >
              <div style={{ flex: 1 }}>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  minWidth: "fit-content",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {d.count}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>prières</span>

                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: "0.15rem 0.4rem",
                    fontSize: "0.75rem",
                    lineHeight: 1,
                    borderRadius: "999px",
                    minWidth: "auto",
                  }}
                  onClick={() => editDayCount(d.date)}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: "0.15rem 0.4rem",
                    fontSize: "0.75rem",
                    lineHeight: 1,
                    borderRadius: "999px",
                    minWidth: "auto",
                    background: "#e02424",
                  }}
                  onClick={() => deleteDay(d.date)}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
