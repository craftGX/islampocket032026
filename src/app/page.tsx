"use client";
import Link from "next/link";

export default function Home() {
  const pages = [
    { href: "/quran", title: "Quran Tracker", desc: "Hizb/Sourates" },
    { href: "/biblio", title: "Bibliothèque", desc: "Livres lus" },
    { href: "/prieres", title: "Salat Prophète", desc: "Compteur" },
    { href: "/dua", title: "Dou'a Coran/Sunnah", desc: "Invocations" },
    { href: "/roqya", title: "Roqya Versets", desc: "Protection" },
    { href: "/verset-jour", title: "Verset Jour", desc: "API Quran" },
  ];

  return (
    <main>
      <h1>Islam Tracker PWA</h1>
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
