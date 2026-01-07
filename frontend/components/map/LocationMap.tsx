"use client";

// IMPORTS
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Star } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const LocationMap: React.FC = () => {
  const position: [number, number] = [31.4187, 73.0791];

  return (
    <div className="relative w-full h-140 rounded-3xl overflow-hidden shadow-xl">
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={icon}>
          <Popup className="custom-popup" maxWidth={190} minWidth={190}>
            <div className="overflow-hidden">

              {/* EDGE-TO-EDGE STORE IMAGE */}
              <img
                src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&auto=format&dpr=2"
                alt="LUXESTORE FAISALABAD"
                className="w-full h-24 object-cover block !m-0 !p-0"
                style={{ display: "block" }}
              />

              {/* COMPACT CONTENT */}
              <div className="px-3 py-2 space-y-0.5">

                {/* Store Name */}
                <h3 className="font-semibold text-[12px] text-gray-900 leading-tight">
                  LuxeStore Faisalabad
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-medium text-gray-900">4.7</span>
                </div>

                {/* Location Row */}
                <div className="flex items-center gap-1.5 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <p className="text-[10px] text-gray-700">
                    174 St. John St, Faisalabad EC1V 4DE, PK
                  </p>
                </div>

                {/* Button with gradient background */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-1.5 rounded-md text-[11px] font-medium
                             shadow-sm transition-all mt-1"
                  style={{
                    background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)",
                    color: "white"
                  }}
                >
                  Get Details
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
