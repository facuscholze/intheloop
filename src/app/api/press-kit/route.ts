import { NextResponse } from "next/server";
import { loadSite, loadShows } from "@/lib/content";

export async function GET() {
  const site = loadSite();
  const shows = loadShows();

  // Generate simple text-based press kit (in production use jsPDF or similar)
  const pressKitText = `
TOMMY PETERSEN - PRESS KIT
IN THE LOOP AGENCY

BIO (ES):
Tommy Petersen es DJ y productor de Buenos Aires, Argentina, especializado en Tribal House, House y Latin grooves con texturas melódicas. Con 3 años de carrera desde los 14, ha tocado en ${shows.length}+ shows en 5 países (AR, ES, BR, FR, DE).

BIO (EN):
Tommy Petersen is a DJ and producer from Buenos Aires, Argentina, specializing in Tribal House, House and Latin grooves with melodic textures. With 3 years career since age 14, he has played ${shows.length}+ shows in 5 countries.

STATS:
- Shows: ${shows.length}
- Countries: 5 (AR, ES, BR, FR, DE)
- Years: 3 (since age 14)
- Genres: Tribal House, House, Latin Grooves, Melodic House
- BPM Range: 122-126
- Equipment: Pioneer CDJ-3000, DJM-A9, Ableton Live, Push 2

CONTACT:
- Email: ${site.contact.email}
- WhatsApp: ${site.contact.whatsapp}
- Instagram: ${site.contact.instagram[0]}
- SoundCloud: ${site.contact.soundcloud}
- YouTube: ${site.contact.youtube}

SOCIALS:
${site.contact.instagram.join("\n")}

SHOWS RECENT:
${shows.slice(0, 10).map((s) => `- ${s.date} - ${s.venue}, ${s.city}, ${s.country}`).join("\n")}

TECH RIDER (basic):
- 2x Pioneer CDJ-3000 or 2000NXS2
- 1x Pioneer DJM-A9 or 900NXS2
- Monitors: 2x high quality (Funktion-One / L-Acoustics / d&b)
- Space: 2m x 1.5m minimum
- Power: 2x power outlets
- Internet: WiFi for emergency

PRESS PHOTOS:
- High-res photos: /media/images/press/ (WebP 2500px + thumb)
- Hero: /media/images/hero/
- Shows: /media/images/shows/
- Logos: /media/brand/

LINKS:
- Website: https://www.intheloop.agency
- Sitemap: https://www.intheloop.agency/sitemap.xml
- OG Image: https://www.intheloop.agency/es/opengraph-image

Generated: ${new Date().toISOString()}
Version: Fase 6 - A11y + Perf + Responsive
`;

  return new NextResponse(pressKitText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tommy-petersen-press-kit.txt"',
    },
  });
}
