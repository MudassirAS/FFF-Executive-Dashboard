// src/components/OrdersHeatmap.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// ---- Types ----
type HeatmapPoint = [number, number, number]; // lat, lng, intensity

interface OrdersHeatmapProps {
  startDate: string;
  endDate: string;
}

// Extend leaflet with heatLayer typing
declare module "leaflet" {
  function heatLayer(
    latlngs: HeatmapPoint[],
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      radius?: number;
      blur?: number;
      max?: number;
      gradient?: Record<string, string>;
    }
  ): L.Layer;
}

export default function OrdersHeatmap({ startDate, endDate }: OrdersHeatmapProps) {
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/ordersHeatmap?startDate=${startDate}&endDate=${endDate}`
        );
        if (!response.ok) throw new Error("Failed to fetch heatmap data");

        const data: { CustomerLatitude: number; CustomerLongitude: number; QtySold: number }[] =
          await response.json();

        const points: HeatmapPoint[] = data
          .filter((row) => row.CustomerLatitude !== null && row.CustomerLongitude !== null)
          .map((row) => [row.CustomerLatitude, row.CustomerLongitude, row.QtySold]);

        setHeatmapPoints(points);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  return (
    <MapContainer
      center={[54.9833, -6.6666]} // Pakistan center as default
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {heatmapPoints.length > 0 && <HeatLayer points={heatmapPoints} />}
    </MapContainer>
  );
}

interface HeatLayerProps {
  points: HeatmapPoint[];
}

function HeatLayer({ points }: HeatLayerProps) {
  const map = useMap();

  useEffect(() => {
    const heat = L.heatLayer(points, { radius: 25 }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}
