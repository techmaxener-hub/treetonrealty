import { ImageResponse } from "next/og";

import { formatINR } from "@/lib/currency";
import { getListingBySlug } from "@/lib/queries/listings";

export const alt = "Property listing on Treeton Realty";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function isImageReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0F172A",
            color: "#F8FAFC",
            fontSize: 56,
          }}
        >
          Treeton Realty
        </div>
      ),
      size
    );
  }

  // Demo/seed listings reference storage paths with no file actually uploaded --
  // check reachability first rather than letting a 404 break image generation.
  const hasPhoto = listing.primaryImageUrl ? await isImageReachable(listing.primaryImageUrl) : false;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0F172A",
        }}
      >
        {hasPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.primaryImageUrl!}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(to top, rgba(15,23,42,0.97), rgba(15,23,42,0.55))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#D97706", marginBottom: 18 }}>
            Treeton Realty
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 1000,
              color: "#F8FAFC",
            }}
          >
            {listing.title}
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 26, fontSize: 30, color: "#F8FAFC" }}>
            <span style={{ display: "flex", color: "#D97706", fontWeight: 700 }}>
              {/* The ₹ glyph isn't present in the default OG font (renders as a
                  missing-glyph box) -- "Rs." avoids that without loading a custom
                  Unicode font just for this image. */}
              Rs. {formatINR(listing.priceInr, { showSymbol: false })}
            </span>
            <span style={{ display: "flex" }}>
              {listing.locality}, {listing.city}
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
