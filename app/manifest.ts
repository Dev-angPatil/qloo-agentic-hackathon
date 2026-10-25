import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TasteMem — Living Archive",
    short_name: "TasteMem",
    description: "A tactile whiteboard for the things you want to remember.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#fbfaf6",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
