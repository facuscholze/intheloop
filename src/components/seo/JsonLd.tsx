import { loadSite, loadTracks } from "@/lib/content";

export function JsonLd() {
  const site = loadSite();
  const tracks = loadTracks();

  const musicGroup = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: site.artist,
    alternateName: site.agency,
    genre: site.genres,
    description: "DJ y productor de Argentina. Tribal House, House y Latin grooves con texturas melódicas.",
    url: "https://www.intheloop.agency",
    sameAs: [...site.contact.instagram, site.contact.youtube, site.contact.soundcloud, site.contact.whatsapp],
    contactPoint: {
      "@type": "ContactPoint",
      email: site.contact.email,
      contactType: "booking",
      availableLanguage: ["es", "en"],
    },
    member: {
      "@type": "Person",
      name: site.artist,
      jobTitle: "DJ / Producer",
      nationality: "AR",
    },
  };

  const recordings = tracks.slice(0, 5).map((t) => ({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: t.title,
    byArtist: {
      "@type": "MusicGroup",
      name: t.artist,
    },
    genre: t.genres,
    duration: t.duration ? `PT${Math.floor(t.duration / 60)}M${Math.floor(t.duration % 60)}S` : undefined,
    inAlbum: {
      "@type": "MusicAlbum",
      name: "In The Loop Agency",
    },
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroup) }} />
      {recordings.map((rec, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(rec) }} />
      ))}
    </>
  );
}
