'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function LeafletMap({ mapData = { zones: [], rivers: [], points: [] } }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const layersRef = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let mapInstance;
    (async () => {
      const L = await import('leaflet');
      if (!containerRef.current) return;
      if (containerRef.current._leaflet_id) {
        containerRef.current.innerHTML = '';
      }
      mapInstance = L.map(containerRef.current, {
        center: [22.9734, 78.6569],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstance);
      mapRef.current = mapInstance;
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted]);

  // Update map overlays when mapData changes
  useEffect(() => {
    if (!mapRef.current || !mounted) return;
    
    (async () => {
      const L = await import('leaflet');
      
      // Clear existing layers
      layersRef.current.forEach(layer => {
        if (mapRef.current) {
          mapRef.current.removeLayer(layer);
        }
      });
      layersRef.current = [];
      
      // Add zones
      mapData.zones.forEach(zone => {
        if (zone.coordinates && zone.coordinates.length > 0) {
          const polygon = L.polygon(zone.coordinates, {
            color: zone.color || '#ff0000',
            weight: 2,
            opacity: 0.8,
            fillColor: zone.color || '#ff0000',
            fillOpacity: 0.3
          }).addTo(mapRef.current);
          
          polygon.bindPopup(`
            <div>
              <h3>${zone.name}</h3>
              <p><strong>Threat Level:</strong> ${zone.threatLevel}</p>
              <p>${zone.description}</p>
            </div>
          `);
          
          layersRef.current.push(polygon);
        }
      });
      
      // Add rivers
      mapData.rivers.forEach(river => {
        if (river.coordinates && river.coordinates.length > 0) {
          const polyline = L.polyline(river.coordinates, {
            color: '#00aaff',
            weight: 3,
            opacity: 0.8
          }).addTo(mapRef.current);
          
          polyline.bindPopup(`
            <div>
              <h3>${river.name}</h3>
              <p>${river.description}</p>
            </div>
          `);
          
          layersRef.current.push(polyline);
        }
      });
      
      // Add points
      mapData.points.forEach(point => {
        if (point.lat && point.lng) {
          const marker = L.marker([point.lat, point.lng]).addTo(mapRef.current);
          
          marker.bindPopup(`
            <div>
              <h3>${point.name}</h3>
              <p>${point.description}</p>
            </div>
          `);
          
          layersRef.current.push(marker);
        }
      });
    })();
  }, [mapData, mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading map...</div>
      </div>
    );
  }

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
