/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [locations, setLocations] = useState<{ lat: number; lng: number }[]>(
    []
  );
  const [routeLayer, setRouteLayer] = useState<L.Polyline | null>(null);
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [markers, setMarkers] = useState<L.Marker[]>([]); // Track all markers

  const droneIcon = L.icon({
    iconUrl: "/drone.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
  const blueMarker = L.icon({
    iconUrl: "/bluemarker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

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

    L.marker([47.64115437373143, 26.244929831845194], {
      icon: droneIcon,
    }).addTo(initMap);

    setMap(initMap);

    return () => {
      initMap.remove();
    };
  }, []);

  const addMarker = (e: L.LeafletMouseEvent) => {
    if (!map) return;

    const newLocation = { lat: e.latlng.lat, lng: e.latlng.lng };

    // Create marker
    const marker = L.marker(e.latlng, {
      icon: blueMarker,
    }).addTo(map);

    // Add click event to remove marker
    marker.on("click", () => {
      map.removeLayer(marker);
      setMarkers((prev) => prev.filter((m) => m !== marker));
      setLocations((prev) =>
        prev.filter(
          (loc) => loc.lat !== newLocation.lat || loc.lng !== newLocation.lng
        )
      );
    });

    // Update state
    setMarkers((prev) => [...prev, marker]);
    setLocations((prev) => [...prev, newLocation]);
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
      setRouteCalculated(true);
    } catch (error) {
      console.error("Error fetching optimal route:", error);
    }
  };

  const drawRoute = (sortedLocations: { lat: number; lng: number }[]) => {
    if (!map) return;

    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    const latLngs: L.LatLngTuple[] = sortedLocations.map(
      (loc) => [loc.lat, loc.lng] as L.LatLngTuple
    );

    const newRouteLayer = L.polyline(latLngs, {
      color: "red",
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    setRouteLayer(newRouteLayer);
    map.fitBounds(newRouteLayer.getBounds());
  };

  const resetMap = () => {
    if (!map) return;

    // Remove all markers
    markers.forEach((marker) => map.removeLayer(marker));
    setMarkers([]); // Clear markers array

    // Remove route layer if present
    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    // Clear all locations and reset state
    setLocations([]);
    setRouteCalculated(false);

    // Reset map view
    map.setView([47.64115437373143, 26.244929831845194], 14);
  };

  return (
    <div className="w-screen h-screen flex bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content (Map & Buttons) */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <h1 className="absolute top-10 text-center text-4xl font-bold text-gray-800">
          {`Route Planner for Drone Delivery System`}
        </h1>

        {/* Map Container */}
        <div className="h-[70vh] w-[70vh] flex items-center justify-center border-gray-700">
          <div ref={mapRef} id="map" className="h-full w-full"></div>
        </div>

        {/* Buttons */}
        {routeCalculated ? (
          <Button
            onClick={resetMap}
            className="absolute bottom-25 right-10 bg-red-500 text-white shadow-md"
          >
            Reset Route
          </Button>
        ) : (
          <Button
            onClick={computeOptimalRoute}
            className="absolute bottom-25 right-10 bg-blue-500 text-white shadow-md"
          >
            Calculate Route
          </Button>
        )}

        <Button
          onClick={() => console.log("Sending locations:", locations)}
          className="absolute bottom-10 right-10 bg-green-500 text-white shadow-md"
        >
          Send Locations
        </Button>
      </div>
    </div>
  );
}
