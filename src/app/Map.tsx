/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [locations, setLocations] = useState<{ lat: number; lng: number }[]>(
    []
  );
  const [routeLayer, setRouteLayer] = useState<L.Polyline | null>(null);

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

    setMap(initMap);

    return () => {
      initMap.remove();
    };
  }, []);

  const addMarker = (e: L.LeafletMouseEvent) => {
    if (!map) return;

    const newLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
    setLocations((prev) => [...prev, newLocation]);
    L.marker(e.latlng).addTo(map);
  };

  useEffect(() => {
    if (map) {
      map.on("click", addMarker);
    }
    return () => {
      if (map) {
        map.off("click", addMarker);
      }
    };
  }, [map]);

  const computeOptimalRoute = async () => {
    if (locations.length < 2) {
      alert("Select at least two locations.");
      return;
    }

    try {
      const response = await fetch("/api/compute-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations }),
      });

      const { sortedLocations } = await response.json();
      console.log("Optimized Order:", sortedLocations);

      drawRoute(sortedLocations);
    } catch (error) {
      console.error("Error fetching optimal route:", error);
    }
  };

  const drawRoute = (sortedLocations: { lat: number; lng: number }[]) => {
    if (!map) return;

    // Remove existing route if any
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Convert sorted locations into LatLng array
    const latLngs: L.LatLngTuple[] = sortedLocations.map(
      (loc) => [loc.lat, loc.lng] as L.LatLngTuple
    );

    // Create and add polyline to the map
    const newRouteLayer = L.polyline(latLngs, {
      color: "red",
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    // Update state with new route layer
    setRouteLayer(newRouteLayer);

    // Fit map to show the whole route
    map.fitBounds(newRouteLayer.getBounds());
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div className="h-[70vh] w-[70vh] bg-gray-200 border-2 border-gray-700 flex items-center justify-center">
        <div ref={mapRef} id="map" className="h-full w-full"></div>
      </div>
      <button
        onClick={computeOptimalRoute}
        className="absolute bottom-25 right-10 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
      >
        Calculate Route
      </button>
      <button
        onClick={() => console.log("Sending locations:", locations)}
        className="absolute bottom-10 right-10 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
      >
        Send Locations
      </button>
    </div>
  );
}
