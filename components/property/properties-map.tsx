"use client";

import "leaflet/dist/leaflet.css";

import * as React from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { ListingImage } from "@/components/property/listing-image";
import { formatINR } from "@/lib/currency";
import type { ListingCard } from "@/lib/queries/listings";

const AHMEDABAD_CENTER: [number, number] = [23.03, 72.51];

function createPriceIcon(priceInr: number, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="whitespace-nowrap rounded-full border-2 ${
      active ? "border-slate-deep bg-slate-deep text-alabaster" : "border-white bg-gold-gradient text-slate-deep"
    } px-3 py-1 text-xs font-bold shadow-gold transition-transform">${formatINR(priceInr)}</div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 14],
    popupAnchor: [40, -8],
  });
}

function FitBounds({ listings }: { listings: ListingCard[] }) {
  const map = useMap();
  const geoListings = React.useMemo(
    () => listings.filter((l): l is ListingCard & { latitude: number; longitude: number } =>
      l.latitude !== null && l.longitude !== null
    ),
    [listings]
  );

  React.useEffect(() => {
    if (geoListings.length === 0) return;
    if (geoListings.length === 1) {
      map.setView([geoListings[0].latitude, geoListings[0].longitude], 14);
      return;
    }
    const bounds = L.latLngBounds(geoListings.map((l) => [l.latitude, l.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [geoListings, map]);

  return null;
}

interface PropertiesMapProps {
  listings: ListingCard[];
  hoveredSlug?: string | null;
}

export default function PropertiesMap({ listings, hoveredSlug }: PropertiesMapProps) {
  const geoListings = listings.filter(
    (l): l is ListingCard & { latitude: number; longitude: number } => l.latitude !== null && l.longitude !== null
  );

  return (
    <MapContainer
      center={AHMEDABAD_CENTER}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#EFEAE0" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds listings={listings} />
      {geoListings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={createPriceIcon(listing.priceInr, hoveredSlug === listing.slug)}
        >
          <Popup>
            <Link href={`/properties/${listing.slug}`} className="flex w-56 gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                <ListingImage
                  src={listing.primaryImageUrl ?? ""}
                  alt={listing.primaryImageAlt}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-deep">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{listing.locality}</p>
                <p className="mt-1 text-sm font-bold text-gold-600">{formatINR(listing.priceInr)}</p>
              </div>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
