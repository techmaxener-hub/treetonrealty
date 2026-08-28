import { ImageResponse } from "next/og";

export const alt = "Treeton Realty -- Your Trusted Real Estate Partner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide fallback OG card. Individual routes (e.g. the PDP) override this with
// their own opengraph-image.tsx; every other route inherits this one automatically
// per Next.js's metadata file convention.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F172A",
        }}
      >
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#F8FAFC" }}>
          Treeton <span style={{ color: "#D97706", marginLeft: 20 }}>Realty</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 28, color: "rgba(248,250,252,0.7)" }}>
          Your Trusted Real Estate Partner
        </div>
        <div style={{ display: "flex", fontSize: 22, marginTop: 12, color: "#D97706" }}>
          Bodakdev / Ambli-Bopal, Ahmedabad
        </div>
      </div>
    ),
    size
  );
}
