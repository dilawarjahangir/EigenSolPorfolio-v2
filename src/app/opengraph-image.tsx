import { ImageResponse } from "next/og";

export const alt = "EigenSol — custom software and product engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #101114 0%, #24262c 68%, #ff7744 100%)",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        <div style={{ color: "#ff9a72", display: "flex", fontSize: 32, fontWeight: 700 }}>
          EIGENSOL
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
          Software engineered for real business outcomes.
        </div>
        <div style={{ color: "#d7d9df", display: "flex", fontSize: 30 }}>
          Web · Mobile · AI · Cloud · Product Engineering
        </div>
      </div>
    </div>,
    size,
  );
}
