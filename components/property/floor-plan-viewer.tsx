"use client";

import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Property } from "@/lib/mock-data";

interface Room {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

function buildResidentialRooms(bedrooms: number): Room[] {
  const rooms: Room[] = [
    { label: "Living / Dining", x: 8, y: 8, w: 240, h: 130, fill: "#F2EFE9" },
    { label: "Kitchen", x: 256, y: 8, w: 136, h: 130, fill: "#EFEAE0" },
  ];
  const bedroomCount = Math.max(bedrooms, 1);
  const bedroomWidth = (400 - 16) / bedroomCount;
  for (let i = 0; i < bedroomCount; i++) {
    rooms.push({
      label: i === 0 ? "Master Bedroom" : `Bedroom ${i + 1}`,
      x: 8 + i * bedroomWidth,
      y: 146,
      w: bedroomWidth - 6,
      h: 120,
      fill: i === 0 ? "#F2EFE9" : "#F7F5F0",
    });
  }
  rooms.push({ label: "Balcony", x: 8, y: 274, w: 384, h: 18, fill: "#E4C766" });
  return rooms;
}

function buildCommercialRooms(): Room[] {
  return [
    { label: "Reception", x: 8, y: 8, w: 190, h: 130, fill: "#F2EFE9" },
    { label: "Open Workspace", x: 202, y: 8, w: 190, h: 130, fill: "#EFEAE0" },
    { label: "Cabin", x: 8, y: 146, w: 190, h: 120, fill: "#F7F5F0" },
    { label: "Restroom", x: 202, y: 146, w: 190, h: 120, fill: "#F2EFE9" },
  ];
}

function FloorPlanSvg({ bedrooms }: { bedrooms: number }) {
  const rooms = bedrooms > 0 ? buildResidentialRooms(bedrooms) : buildCommercialRooms();

  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <rect x="2" y="2" width="396" height="296" fill="#FAF9F6" stroke="#D4AF37" strokeWidth="2" />
      {rooms.map((room) => (
        <g key={room.label}>
          <rect
            x={room.x}
            y={room.y}
            width={room.w}
            height={room.h}
            fill={room.fill}
            stroke="#1A1F2C"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
          <text
            x={room.x + room.w / 2}
            y={room.y + room.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight={500}
            fill="#1A1F2C"
          >
            {room.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MasterPlanSvg() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <rect width="400" height="300" fill="#EFEAE0" />
      <rect x="20" y="220" width="360" height="16" fill="#D9D2C4" />
      {[60, 150, 240, 330].map((x, i) => (
        <rect key={x} x={x - 25} y="60" width="50" height="150" fill="#1A1F2C" opacity={0.85 - i * 0.05} />
      ))}
      <circle cx="200" cy="185" r="26" fill="#7FB3A8" />
      <rect x="170" y="20" width="60" height="30" fill="#D4AF37" opacity={0.8} />
      <text x="200" y="40" textAnchor="middle" fontSize="10" fill="#1A1F2C" fontWeight={600}>
        Clubhouse
      </text>
      <text x="200" y="189" textAnchor="middle" fontSize="9" fill="#12151E" fontWeight={600}>
        Pool
      </text>
      <text x="200" y="270" textAnchor="middle" fontSize="10" fill="#1A1F2C" fontWeight={600}>
        Entrance Boulevard
      </text>
    </svg>
  );
}

export function FloorPlanViewer({ property }: { property: Property }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-display text-xl font-semibold text-charcoal">Floor Plans</p>
      <Tabs defaultValue="2d" className="mt-4">
        <TabsList>
          <TabsTrigger value="2d">2D Layout</TabsTrigger>
          <TabsTrigger value="3d">3D Render</TabsTrigger>
          <TabsTrigger value="master">Master Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="2d">
          <div className="h-[340px] rounded-xl bg-ivory p-4">
            <FloorPlanSvg bedrooms={property.bedrooms} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Indicative layout, not to scale. Actual unit configuration may vary by tower/floor.
          </p>
        </TabsContent>

        <TabsContent value="3d">
          <div className="grid gap-3 sm:grid-cols-2">
            {property.images.slice(0, 4).map((img, i) => (
              <div key={img + i} className="relative h-48 overflow-hidden rounded-xl">
                <Image
                  src={img}
                  alt={`${property.title} 3D render ${i + 1}`}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="master">
          <div className="h-[340px] rounded-xl bg-ivory p-4">
            <MasterPlanSvg />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Illustrative site plan. Final tower positioning, landscaping, and amenity placement
            are subject to the sanctioned building plan.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
