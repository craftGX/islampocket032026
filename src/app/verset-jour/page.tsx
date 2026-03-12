"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VerseState = {
  arabic: string;
  french: string;
  surahName: string;
  reference: string;
  loading: boolean;
  error: string | null;
};

export default function VersetJour() {
  const [verse, setVerse] = useState<VerseState>({
    arabic: "",
    french: "",
    surahName: "",
    reference: "",
    loading: false,
    error: null,
  });

  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const d = new Date();
    setTodayLabel(
      d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);
  // [web:132]

  const fetchRandomAyah = async () => {
    try {
      setVerse((prev) => ({ ...prev, loading: true, error: null }));

      const randomNumber = Math.floor(Math.random() * 6236) + 1;
      const url =
        "https://api.alquran.cloud/v1/ayah/" +
        randomNumber +
        "/editions/quran-uthmani,fr.hamidullah";
      const res = await fetch(url);
      const json = await res.json();

      if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 2) {
        throw new Error("Réponse API invalide");
      }

      const arabicEdition = json.data[0];
      const frenchEdition = json.data[1];

      const surah = arabicEdition.surah;
      const arabicText = arabicEdition.text as string;
      const frenchText = frenchEdition.text as string;
      const surahName = `${surah.englishName} (${surah.number})`;
      const reference = `Sourate ${surah.number}, verset ${arabicEdition.numberInSurah}`;

      setVerse({
        arabic: arabicText,
        french: frenchText,
        surahName,
        reference,
        loading: false,
        error: null,
      });
    } catch (e) {
      setVerse((prev) => ({
        ...prev,
        loading: false,
        error: "Impossible de charger un verset. Vérifie ta connexion.",
      }));
    }
  };
  // [web:117][web:120]

  useEffect(() => {
    fetchRandomAyah();
  }, []);

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Verset du jour</h1>
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {todayLabel || "Chargement de la date..."}
      </p>

      <section className="list-item">
        {verse.loading && (
          <p style={{ textAlign: "center", fontSize: "0.95rem" }}>Chargement d&apos;un verset...</p>
        )}

        {verse.error && (
          <p style={{ textAlign: "center", color: "#b91c1c", fontSize: "0.9rem" }}>{verse.error}</p>
        )}

        {!verse.loading && !verse.error && verse.arabic && (
          <>
            <p
              className="verse"
              style={{
                direction: "rtl",
                textAlign: "right",
                marginBottom: "0.8rem",
                fontSize: "1.2rem",
              }}
            >
              {verse.arabic}
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                marginBottom: "0.4rem",
                lineHeight: 1.7,
              }}
            >
              {verse.french}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: "0.2rem" }}>
              {verse.reference}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#777" }}>{verse.surahName}</p>
          </>
        )}
      </section>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button className="btn" onClick={fetchRandomAyah}>
          🔄 Nouveau verset
        </button>
      </div>
    </main>
  );
}
