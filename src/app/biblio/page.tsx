"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BookStatus = "lu" | "en_cours" | "a_lire";

type Book = {
  id: string;
  titre: string;
  auteur: string;
  dateEntree: string; // ISO (YYYY-MM-DD)
  status: BookStatus;
};

export default function Biblio() {
  const [books, setBooks] = useState<Book[]>([]);
  const [titre, setTitre] = useState("");
  const [auteur, setAuteur] = useState("");
  const [dateEntree, setDateEntree] = useState("");
  const [status, setStatus] = useState<BookStatus>("a_lire");

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("biblio");
    if (saved) {
      try {
        setBooks(JSON.parse(saved));
      } catch {
        setBooks([]);
      }
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("biblio", JSON.stringify(books));
  }, [books]);
  // [web:95][web:87]

  const resetForm = () => {
    setTitre("");
    setAuteur("");
    setDateEntree("");
    setStatus("a_lire");
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!titre.trim() || !auteur.trim()) return;

    const dateValue = dateEntree || new Date().toISOString().slice(0, 10); // yyyy-mm-dd par défaut [web:93]

    if (editingId) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? {
                ...b,
                titre: titre.trim(),
                auteur: auteur.trim(),
                dateEntree: dateValue,
                status,
              }
            : b,
        ),
      );
    } else {
      const newBook: Book = {
        id: crypto.randomUUID(),
        titre: titre.trim(),
        auteur: auteur.trim(),
        dateEntree: dateValue,
        status,
      };
      setBooks((prev) => [newBook, ...prev]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce livre ?")) return;
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setTitre(book.titre);
    setAuteur(book.auteur);
    setDateEntree(book.dateEntree);
    setStatus(book.status);
  };

  // Recherche
  const filteredBooks = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return books;
    return books.filter(
      (b) => b.titre.toLowerCase().includes(term) || b.auteur.toLowerCase().includes(term),
    );
  }, [books, search]);
  // [web:91][web:94]

  // Récap
  const recap = useMemo(() => {
    const total = books.length;
    const lu = books.filter((b) => b.status === "lu").length;
    const enCours = books.filter((b) => b.status === "en_cours").length;
    const aLire = books.filter((b) => b.status === "a_lire").length;
    return { total, lu, enCours, aLire };
  }, [books]);

  const statusLabel = (s: BookStatus) =>
    s === "lu" ? "Lu" : s === "en_cours" ? "En cours" : "À lire";

  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Bibliothèque</h1>

      {/* Récap global */}
      <section className="list-item" style={{ marginBottom: "1rem" }}>
        <h2>Récapitulatif</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
          Total : <strong>{recap.total}</strong> livre(s)
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Lu : <strong>{recap.lu}</strong> • En cours : <strong>{recap.enCours}</strong> • À lire :{" "}
          <strong>{recap.aLire}</strong>
        </p>
      </section>

      {/* Formulaire livre */}
      <section className="list-item">
        <h2>{editingId ? "Modifier un livre" : "Ajouter un livre"}</h2>

        <label style={{ fontSize: "0.9rem" }}>Titre</label>
        <input
          className="input"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du livre"
        />

        <label style={{ fontSize: "0.9rem" }}>Auteur</label>
        <input
          className="input"
          value={auteur}
          onChange={(e) => setAuteur(e.target.value)}
          placeholder="Auteur"
        />

        <div className="biblio-form-row">
          <div className="biblio-form-row-date">
            <label style={{ fontSize: "0.9rem", display: "block" }}>Date d&apos;entrée</label>
            <input
              type="date"
              className="input"
              value={dateEntree}
              onChange={(e) => setDateEntree(e.target.value)}
            />
          </div>

          <div className="biblio-form-row-status">
            <label style={{ fontSize: "0.9rem", display: "block" }}>Statut</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
            >
              <option value="a_lire">À lire</option>
              <option value="en_cours">En cours</option>
              <option value="lu">Lu</option>
            </select>
          </div>
        </div>

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

      {/* Barre de recherche */}
      <section className="list-item" style={{ marginTop: "1rem" }}>
        <h2>Recherche</h2>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre ou auteur"
        />
        <p style={{ fontSize: "0.85rem", color: "#777", marginTop: "0.3rem" }}>
          Résultats : {filteredBooks.length} livre(s)
        </p>
      </section>

      {/* Liste des livres */}
      <section style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <h2>Mes livres</h2>
        {filteredBooks.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>Aucun livre pour l&apos;instant.</p>
        )}

        {filteredBooks.map((book) => (
          <div key={book.id} className="list-item" style={{ marginTop: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {book.titre}{" "}
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>— {book.auteur}</span>
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#666",
                    marginTop: "0.2rem",
                  }}
                >
                  Entré le{" "}
                  {book.dateEntree ? new Date(book.dateEntree).toLocaleDateString("fr-FR") : "—"}
                  {" • "}
                  Statut :{" "}
                  <span
                    style={{
                      padding: "0.1rem 0.45rem",
                      borderRadius: "999px",
                      background:
                        book.status === "lu"
                          ? "#bbf7d0"
                          : book.status === "en_cours"
                            ? "#fee2b3"
                            : "#e0f2fe",
                      fontSize: "0.8rem",
                    }}
                  >
                    {statusLabel(book.status)}
                  </span>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  alignItems: "flex-end",
                }}
              >
                <button
                  className="btn"
                  style={{ paddingInline: "0.7rem", fontSize: "0.8rem" }}
                  onClick={() => handleEdit(book)}
                >
                  ✏️
                </button>
                <button
                  className="btn"
                  style={{
                    paddingInline: "0.7rem",
                    fontSize: "0.8rem",
                    background: "#e02424",
                  }}
                  onClick={() => handleDelete(book.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
