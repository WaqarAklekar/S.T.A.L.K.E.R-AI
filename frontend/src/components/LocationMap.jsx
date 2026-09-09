import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof latitude === "number" &&
      typeof longitude === "number"
    ) {
      map.setView([latitude, longitude], 15, {
        animate: true,
      });
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  markers = [],
  height = "420px",
}) {
  const hasLocation =
    typeof latitude === "number" &&
    typeof longitude === "number";

  const defaultCenter = [19.033, 73.029];

  const center = hasLocation
    ? [latitude, longitude]
    : defaultCenter;

  return (
    <div
      style={{
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: "16px",
        position: "relative",
      }}
    >
      <MapContainer
        center={center}
        zoom={hasLocation ? 15 : 11}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasLocation && (
          <>
            <Marker
              position={[latitude, longitude]}
              icon={defaultIcon}
            >
              <Popup>
                <strong>Your Location</strong>

                <br />

                Latitude: {latitude.toFixed(6)}

                <br />

                Longitude: {longitude.toFixed(6)}
              </Popup>
            </Marker>

            <RecenterMap
              latitude={latitude}
              longitude={longitude}
            />
          </>
        )}

        {markers.map((marker) => {
          if (
            typeof marker.latitude !== "number" ||
            typeof marker.longitude !== "number"
          ) {
            return null;
          }

          return (
            <Marker
              key={marker.id}
              position={[
                marker.latitude,
                marker.longitude,
              ]}
              icon={defaultIcon}
            >
              <Popup>
                <strong>
                  {marker.title ||
                    "Investigation Location"}
                </strong>

                {marker.description && (
                  <>
                    <br />
                    {marker.description}
                  </>
                )}

                {marker.caseId && (
                  <>
                    <br />
                    Case: {marker.caseId}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}