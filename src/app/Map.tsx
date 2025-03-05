"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = L.map(mapRef.current).setView(
      [47.64115437373143, 26.244929831845194],
      14
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(initMap);

    return () => {
      initMap.remove();
    };
  }, []);

  return (
    <div ref={mapRef} id="map" className="h-full w-100 z-1000000000"></div>
  );
}
