"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RecapTotalCard from "./recap/page";

export default function Home() {
  const pages = [
    { href: "/quran", title: "Quran Tracker", desc: "Hizb/Sourates" },
    { href: "/biblio", title: "Bibliothèque", desc: "Livres lus" },
    { href: "/dua", title: "Dou'a Coran/Sunnah", desc: "Invocations" },
    { href: "/roqya", title: "Roqya Versets", desc: "Protection" },
    { href: "/verset-jour", title: "Verset Jour", desc: "API Quran" },
  ];

  // Couleurs distinctes pour chaque carte (tu peux ajuster les codes)
  const cardColors = [
    "#86efac", // vert plus clair (avant: #22c55e)
    "#93c5fd", // bleu plus clair (avant: #3b82f6)
    "#fdba74", // orange plus clair (avant: #f97316)
    "#d8b4fe", // violet plus clair (avant: #a855f7)
    "#f9a8d4", // rose plus clair (avant: #ec4899)
    "#fde68a", // jaune plus clair (avant: #eab308)
  ];

  const [todayLabel, setTodayLabel] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    setTodayLabel(
      today.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <main>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ textAlign: "center", marginBottom: "1rem" }}
      >
        <h1>Islam Tracker PWA</h1>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#666",
            marginTop: "0.25rem",
          }}
        >
          {todayLabel}
        </p>
      </motion.header>

      {/* Grille comme à l'origine, avec couleur distincte par carte */}
      <div className="grid">
        {pages.map((page, i) => (
          <Link
            key={i}
            href={page.href}
            className="card"
            style={{
              backgroundColor: cardColors[i % cardColors.length],
              color: "#fff",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "15px", // <-- marge en bas
            }}
          >
            <h2
              style={{
                marginBottom: "0.25rem",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              {page.title}
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.9,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              {page.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Récap totale au-dessus de la grille */}
      <RecapTotalCard />
    </main>
  );
}
