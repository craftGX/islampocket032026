"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FixedDua = {
  id: string;
  title: string;
  arabic: string;
  french: string;
  proof: string;
};

type CustomDua = {
  id: string;
  arabic: string;
  french: string;
  proof: string;
};

const fixedDuas: FixedDua[] = [
  {
    id: "rabbana_atina",
    title: "Demande du bien ici-bas et dans l’au-delà",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    french:
      "Seigneur, accorde-nous une belle part ici-bas, une belle part aussi dans l’au-delà, et protège-nous du châtiment du Feu.",
    proof: "Coran 2:201",
  },
  {
    id: "rabbana_dhulamna",
    title: "Demande de pardon pour les péchés",
    arabic:
      "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    french:
      "Seigneur, nous nous sommes fait du tort à nous-mêmes. Et si Tu ne nous pardonnes pas et ne nous fais pas miséricorde, nous serons très certainement du nombre des perdants.",
    proof: "Coran 7:23",
  },
  {
    id: "hasbuna_allah",
    title: "Confiance en Allah",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    french: "Allah nous suffit, et Il est le meilleur garant.",
    proof: "Coran 3:173",
  },
  {
    id: "sayyid_al_istighfar",
    title: "Sayyid al-istighfâr (maître des demandes de pardon)",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي، لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    french:
      "Ô Allah, Tu es mon Seigneur, nul dieu sauf Toi. Tu m’as créé et je suis Ton serviteur. Je reste fidèle à Ton pacte et à Ta promesse autant que je peux. Je cherche protection auprès de Toi contre le mal que j’ai commis. Je reconnais Ton bienfait envers moi et je reconnais mon péché. Pardonne-moi, car nul autre que Toi ne pardonne les péchés.",
    proof: "Hadith authentique, Al-Bukhari",
  },
];

export default function DuaPage() {
  const [customDuas, setCustomDuas] = useState<CustomDua[]>([]);
  const [arabic, setArabic] = useState("");
  const [french, setFrench] = useState("");
  const [proof, setProof] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("customDuas");
    if (saved) {
      try {
        setCustomDuas(JSON.parse(saved));
      } catch {
        setCustomDuas([]);
      }
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("customDuas", JSON.stringify(customDuas));
  }, [customDuas]);
  // [web:95][web:90]

  const resetForm = () => {
    setArabic("");
    setFrench("");
    setProof("");
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!arabic.trim() || !french.trim()) return;

    if (editingId) {
      setCustomDuas((prev) =>
        prev.map((d) =>
          d.id === editingId
            ? {
                ...d,
                arabic: arabic.trim(),
                french: french.trim(),
                proof: proof.trim(),
              }
            : d,
        ),
      );
    } else {
      const newDua: CustomDua = {
        id: crypto.randomUUID(),
        arabic: arabic.trim(),
        french: french.trim(),
        proof: proof.trim(),
      };
      setCustomDuas((prev) => [newDua, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (dua: CustomDua) => {
    setEditingId(dua.id);
    setArabic(dua.arabic);
    setFrench(dua.french);
    setProof(dua.proof);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette dou‘a ?")) return;
    setCustomDuas((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Dou‘a Coran & Sounnah</h1>

      {/* Douas fixes */}
      <section className="list-item">
        <h2>Dou‘a authentiques</h2>
        <p
          style={{
            fontSize: "0.9rem",
            marginBottom: "0.6rem",
            color: "#666",
            textAlign: "center",
          }}
        >
          Dou‘a tirées du Coran et de la Sounnah authentique (arabe français, avec preuve).
        </p>

        {fixedDuas.map((d) => (
          <div
            key={d.id}
            className="list-item"
            style={{ marginTop: "0.5rem", padding: "0.7rem 0.8rem" }}
          >
            <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{d.title}</p>
            <p
              className="verse"
              style={{
                direction: "rtl",
                textAlign: "right",
                marginBottom: "0.4rem",
                fontSize: "1.1rem",
              }}
            >
              {d.arabic}
            </p>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>{d.french}</p>
            <p style={{ fontSize: "0.8rem", color: "#777" }}>{d.proof}</p>
          </div>
        ))}
      </section>

      {/* Mes douas personnalisées */}
      <section className="list-item" style={{ marginTop: "1rem" }}>
        <h2>Mes dou‘a personnalisées</h2>
        <p
          style={{
            fontSize: "0.85rem",
            marginBottom: "0.5rem",
            color: "#777",
          }}
        >
          Ici tu peux enregistrer tes propres dou‘a (en arabe, français et ajouter la preuve si tu
          veux).
        </p>

        {/* Formulaire */}
        <label style={{ fontSize: "0.9rem" }}>Texte arabe</label>
        <textarea
          className="input"
          style={{ minHeight: "70px", resize: "vertical", direction: "rtl" }}
          value={arabic}
          onChange={(e) => setArabic(e.target.value)}
          placeholder="Écris ici la dou‘a en arabe"
        />

        <label style={{ fontSize: "0.9rem" }}>Traduction française</label>
        <textarea
          className="input"
          style={{ minHeight: "70px", resize: "vertical" }}
          value={french}
          onChange={(e) => setFrench(e.target.value)}
          placeholder="Traduction ou explication en français"
        />

        <label style={{ fontSize: "0.9rem" }}>Preuve / source (optionnel)</label>
        <input
          className="input"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Ex : Coran 2:201, Muslim, Bukhari..."
        />

        <div style={{ marginTop: "0.6rem" }}>
          <button className="btn" onClick={handleAddOrUpdate}>
            {editingId ? "💾 Enregistrer" : "➕ Ajouter"}
          </button>
          {editingId && (
            <button
              className="btn"
              style={{ marginLeft: "0.5rem", background: "#808d8e" }}
              onClick={resetForm}
            >
              Annuler
            </button>
          )}
        </div>
      </section>

      {/* Liste des douas perso */}
      <section style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <h2>Dou‘a sauvegardées</h2>
        {customDuas.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>
            Aucune dou‘a personnalisée pour l&apos;instant.
          </p>
        )}

        {customDuas.map((d) => (
          <div
            key={d.id}
            className="list-item"
            style={{ marginTop: "0.5rem", padding: "0.7rem 0.8rem" }}
          >
            <p
              className="verse"
              style={{
                direction: "rtl",
                textAlign: "right",
                marginBottom: "0.4rem",
                fontSize: "1.1rem",
              }}
            >
              {d.arabic}
            </p>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>{d.french}</p>
            {d.proof && (
              <p style={{ fontSize: "0.8rem", color: "#777", marginBottom: "0.35rem" }}>
                Preuve : {d.proof}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                justifyContent: "flex-end",
                marginTop: "0.2rem",
              }}
            >
              <button
                className="btn"
                style={{ paddingInline: "0.7rem", fontSize: "0.8rem" }}
                onClick={() => handleEdit(d)}
              >
                ✏️ Modifier
              </button>
              <button
                className="btn"
                style={{
                  paddingInline: "0.7rem",
                  fontSize: "0.8rem",
                  background: "#e02424",
                }}
                onClick={() => handleDelete(d.id)}
              >
                🗑 Supprimer
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
