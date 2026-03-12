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

function getLastFriday(today: Date) {
  const d = new Date(today);
  const day = d.getDay(); // 0=dim, 5=vendredi
  const diff = (day + 1 + 7 - 5) % 7; // nearest past vendredi
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
// [web:105]

export default function PrieresPage() {
  const [days, setDays] = useState<DayCount[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  // On stocke les dates dans le state, initialisées après montage
  const [today, setToday] = useState<Date | null>(null);
  const [todayKey, setTodayKey] = useState<string>("");
  const [lastFriday, setLastFriday] = useState<Date | null>(null);
  const [lastFridayKey, setLastFridayKey] = useState<string>("");

  // Initialise dates côté client après montage
  useEffect(() => {
    const t = new Date();
    const k = formatDateISO(t);
    const lf = getLastFriday(t);
    const lfKey = formatDateISO(lf);

    setToday(t);
    setTodayKey(k);
    setLastFriday(lf);
    setLastFridayKey(lfKey);
  }, []);
  // [web:132]

  // LOAD (une fois que todayKey est connu)
  useEffect(() => {
    if (!todayKey) return;
    const saved = localStorage.getItem("prieresByDay");
    if (saved) {
      try {
        const parsed: DayCount[] = JSON.parse(saved);
        setDays(parsed);
        const todayRow = parsed.find((d) => d.date === todayKey);
        setTodayCount(todayRow ? todayRow.count : 0);
      } catch {
        setDays([]);
        setTodayCount(0);
      }
    }
  }, [todayKey]);

  // SAVE
  useEffect(() => {
    localStorage.setItem("prieresByDay", JSON.stringify(days));
  }, [days]);
  // [web:95]

  const incrementToday = () => {
    if (!todayKey) return;
    setDays((prev) => {
      const existing = prev.find((d) => d.date === todayKey);
      if (existing) {
        return prev.map((d) => (d.date === todayKey ? { ...d, count: d.count + 1 } : d));
      } else {
        return [...prev, { date: todayKey, count: 1 }];
      }
    });
    setTodayCount((c) => c + 1);
  };

  const totalAllTime = useMemo(() => days.reduce((sum, d) => sum + d.count, 0), [days]);

  const lastFridayCount = lastFridayKey
    ? (days.find((d) => d.date === lastFridayKey)?.count ?? 0)
    : 0;

  const comparePercent =
    lastFridayCount === 0
      ? todayCount > 0
        ? 100
        : 0
      : Math.round(((todayCount - lastFridayCount) / lastFridayCount) * 100);
  // [web:104]

  const sortedDays = useMemo(
    () => [...days].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [days],
  );

  const todayLabel =
    today &&
    today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const lastFridayLabel =
    lastFriday &&
    lastFriday.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const isReady = !!today && !!todayKey && !!lastFriday && !!lastFridayKey;

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Prières sur le Prophète ﷺ</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {todayLabel || "Chargement de la date..."}
      </p>

      {/* Bouton principal + recap jour */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Compteur du jour</h2>
        <div className="counter">{todayCount} prières aujourd&apos;hui</div>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          Clique sur le bouton à chaque fois que tu fais une prière sur le Prophète ﷺ.
        </p>
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
            onMouseDown={(e) => {
              if (!isReady) return;
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.transform = "scale(0.95) translateY(2px)";
              btn.style.boxShadow = "0 10px 20px rgba(148, 126, 176, 0.4)";
              btn.style.filter = "brightness(0.95)";
            }}
            onMouseUp={(e) => {
              if (!isReady) return;
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.transform = "scale(1) translateY(0)";
              btn.style.boxShadow = "0 18px 35px rgba(148, 126, 176, 0.45)";
              btn.style.filter = "brightness(1)";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.transform = "scale(1) translateY(0)";
              btn.style.boxShadow = "0 18px 35px rgba(148, 126, 176, 0.45)";
              btn.style.filter = "brightness(1)";
            }}
          >
            +1
          </button>
        </div>
      </section>

      {/* Récap global */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Récap global</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Total depuis le début : <strong>{totalAllTime}</strong> prières
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Dernier vendredi ({lastFridayLabel || "..."}): <strong>{lastFridayCount}</strong> prières
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
