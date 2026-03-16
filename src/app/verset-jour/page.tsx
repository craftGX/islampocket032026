"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

type VerseState = {
  arabic: string;
  french: string;
  surahName: string;
  reference: string;
};

async function fetchRandomAyah(): Promise<VerseState> {
  const randomNumber = Math.floor(Math.random() * 6236) + 1;
  const url =
    "https://api.alquran.cloud/v1/ayah/" + randomNumber + "/editions/quran-uthmani,fr.hamidullah";

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

  return {
    arabic: arabicText,
    french: frenchText,
    surahName,
    reference,
  };
}

export default function VersetJour() {
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

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<VerseState>({
    queryKey: ["verset-du-jour"],
    queryFn: fetchRandomAyah,
    refetchOnWindowFocus: false,
  });

  const handleNewVerse = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error("Impossible de charger un verset. Vérifie ta connexion.");
    } else {
      toast.success("Nouveau verset chargé ✅");
    }
  };

  const verse = data;

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
        Verset du jour
      </motion.h1>

      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        {todayLabel || "Chargement de la date..."}
      </p>

      <motion.section
        className="list-item"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {(isLoading || isFetching) && (
          <p style={{ textAlign: "center", fontSize: "0.95rem" }}>Chargement d&apos;un verset...</p>
        )}

        {isError && (
          <p
            style={{
              textAlign: "center",
              color: "#b91c1c",
              fontSize: "0.9rem",
            }}
          >
            {(error as Error)?.message || "Impossible de charger un verset. Vérifie ta connexion."}
          </p>
        )}

        {!isLoading && !isFetching && !isError && verse && (
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
            <p
              style={{
                fontSize: "0.85rem",
                color: "#777",
                marginBottom: "0.2rem",
              }}
            >
              {verse.reference}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#777" }}>{verse.surahName}</p>
          </>
        )}
      </motion.section>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          className="btn"
          onClick={handleNewVerse}
          disabled={isFetching}
          style={{
            opacity: isFetching ? 0.7 : 1,
          }}
        >
          {isFetching ? "Chargement..." : "🔄 Nouveau verset"}
        </button>
      </div>
    </main>
  );
}
