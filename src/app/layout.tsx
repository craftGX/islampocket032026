import "./globals.css";
import type { ReactNode } from "react";
import ReactQueryProvider from "./ReactQueryProvider";
import ToastContainerClient from "@/components/ToastContainerClient";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ReactQueryProvider>
          {children}
          <ToastContainerClient />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
