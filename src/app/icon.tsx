import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#07070A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FF5A1F",
          fontWeight: 800,
          borderRadius: "50%",
          border: "2px solid #FF5A1F",
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
