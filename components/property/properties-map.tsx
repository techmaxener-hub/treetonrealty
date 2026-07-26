"use client";

import "leaflet/dist/leaflet.css";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { formatIndianPrice, type Property } from "@/lib/mock-data";

const AHMEDABAD_CENTER: [number, number] = [23.06, 72.56];

function compactPrice(priceInCr: number) {
  if (priceInCr >= 1) return `₹${priceInCr.toFixed(2).replace(/\.?0+$/, "")}Cr`;
  return `₹${Math.round(priceInCr * 100)}L`;
}

function createPriceIcon(priceInCr: number, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="whitespace-nowrap rounded-full border-2 ${
      active ? "border-charcoal bg-charcoal text-ivory" : "border-white bg-champagne-gradient text-charcoal"
    } px-3 py-1 text-xs font-bold shadow-gold transition-transform">${compactPrice(priceInCr)}</div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 14],
    popupAnchor: [40, -8],
  });
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();

  React.useEffect(() => {
    if (properties.length === 0) return;
    if (properties.length === 1) {
      map.setView([properties[0].lat, properties[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [properties, map]);

  return null;
}

interface PropertiesMapProps {
  properties: Property[];
  hoveredSlug?: string | null;
}

export default function PropertiesMap({ properties, hoveredSlug }: PropertiesMapProps) {
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
      <FitBounds properties={properties} />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={createPriceIcon(property.priceInCr, hoveredSlug === property.slug)}
        >
          <Popup>
            <Link href={`/properties/${property.slug}`} className="flex w-56 gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                <Image src={property.heroImage} alt={property.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-charcoal">{property.title}</p>
                <p className="text-xs text-muted-foreground">{property.locality}</p>
                <p className="mt-1 text-sm font-bold text-champagne-dark">
                  {formatIndianPrice(property.priceInCr)}
                </p>
              </div>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
