import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tommy Petersen — Tribal House DJ | In The Loop Agency";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { locale: string } }) {
  const locale = params.locale;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#07070A",
          color: "#F5F3EF",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            left: "10%",
            top: "20%",
            width: "60%",
            height: "60%",
            background: "radial-gradient(ellipse at center, rgba(255,90,31,0.3), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "10%",
            bottom: "10%",
            width: "50%",
            height: "50%",
            background: "radial-gradient(ellipse at center, rgba(255,46,147,0.25), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", zIndex: 10, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "monospace", fontSize: "14px", letterSpacing: "0.3em", color: "#8A8890" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C8FF00" }} />
            IN THE LOOP AGENCY • ARG → EU → BR
          </div>

          <div style={{ marginTop: "40px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "sans-serif", fontSize: "100px", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.05em" }}>TOMMY</div>
            <div
              style={{
                fontFamily: "sans-serif",
                fontSize: "100px",
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: "-0.05em",
                background: "linear-gradient(90deg, #FF5A1F, #FF2E93, #FFD60A)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              PETERSEN
            </div>
          </div>

          <div style={{ marginTop: "20px", fontFamily: "monospace", fontSize: "16px", letterSpacing: "0.2em", color: "#8A8890" }}>
            TRIBAL HOUSE / HOUSE / LATIN GROOVES — ARGENTINA
          </div>

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontFamily: "sans-serif", fontSize: "20px", color: "#F5F3EF", maxWidth: "500px", lineHeight: 1.4 }}>
              Every dancefloor has its own story. I&apos;m here to tell mine.
            </div>
            <div style={{ display: "flex", gap: "12px", fontFamily: "monospace", fontSize: "12px", color: "#4A4852" }}>
              <span>SOUNDCLOUD</span>
              <span>YOUTUBE</span>
              <span>INSTAGRAM</span>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "4px", background: "linear-gradient(90deg, #FF5A1F, #FF2E93, #C8FF00)" }} />
      </div>
    ),
    { ...size }
  );
}
