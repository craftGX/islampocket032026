"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RecapTotalCard from "./recap/page";

export default function Home() {
  const pages = [
    { href: "/quran", title: "Quran Tracker", desc: "Hizb/Sourates" },
    { href: "/biblio", title: "Bibliothèque", desc: "Livres lus" },
    { href: "/prieres", title: "Salat Prophète", desc: "Compteur" },
    { href: "/dua", title: "Dou'a Coran/Sunnah", desc: "Invocations" },
    { href: "/roqya", title: "Roqya Versets", desc: "Protection" },
    { href: "/verset-jour", title: "Verset Jour", desc: "API Quran" },
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
        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>{todayLabel}</p>
      </motion.header>

      {/* Récap totale au-dessus de la grille */}
      <RecapTotalCard />

      {/* Grille exactement comme ton code d’origine */}
      <div className="grid">
        {pages.map((page, i) => (
          <Link key={i} href={page.href} className="card">
            <h2>{page.title}</h2>
            <p>{page.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
