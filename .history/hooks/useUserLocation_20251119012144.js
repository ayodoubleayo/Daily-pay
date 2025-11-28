// hooks/useUserLocation.js
"use client";
import { useEffect, useState } from "react";

export default function useUserLocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocation(null);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  return location;
}
