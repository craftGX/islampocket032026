import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Islam PWA Tracker",
    short_name: "IslamPWA",
    description: "Tracker Coran, prières, dou'a, roqya",
    theme_color: "#99aa38",
    background_color: "#0a210f",
    display: "standalone",
    start_url: "/",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
