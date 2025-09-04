// src/components/OrdersHeatmap.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

type HeatmapPoint = [number, number, number]; // lat, lng, intensity

interface OrdersHeatmapProps {
  data?: { CustomerLatitude: number | null; CustomerLongitude: number | null; QtySold: number | null }[] | null;
}

type LeafletWithHeat = {
  heatLayer: (latlngs: HeatmapPoint[], options?: { radius?: number; blur?: number; max?: number }) => L.Layer;
};

export default function OrdersHeatmap({ data }: OrdersHeatmapProps) {
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    if (!data) {
      // parent still loading (data === undefined) or no data (null) -> clear points
      setHeatmapPoints([]);
      return;
    }

    const points: HeatmapPoint[] = data
      .filter((row) => row.CustomerLatitude !== null && row.CustomerLongitude !== null)
      .map((row) => [Number(row.CustomerLatitude), Number(row.CustomerLongitude), Number(row.QtySold ?? 1)]);

    setHeatmapPoints(points);
  }, [data]);

  return (
    <MapContainer
      center={[54.9844, -6.704]} // approximate Garvagh Forest center
      zoom={10}
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

function HeatLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const leafletWithHeat = (L as unknown) as LeafletWithHeat;

    // create heat layer and add to map
    const heat = leafletWithHeat.heatLayer(points, { radius: 25 }).addTo(map);

    return () => {
      try {
        if (map.hasLayer(heat)) {
          map.removeLayer(heat);
        }
      } catch (e) {
        // ignore remove errors
      }
    };
  }, [map, points]);

  return null;
}
