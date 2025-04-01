import { useEffect, useRef } from 'react';
import { LightTower } from '@/types';
import { statusColors } from '@/types';

// We'd normally import these properly, but for this we're using script tags
declare global {
  interface Window {
    L: any;
  }
}

interface TowerMapProps {
  towers: LightTower[];
  selectedTower?: LightTower;
  onTowerSelect?: (tower: LightTower) => void;
}

const TowerMap = ({ towers, selectedTower, onTowerSelect }: TowerMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet if it doesn't exist yet
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
      script.integrity = 'sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=';
      script.crossOrigin = '';
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (leafletMap.current && markersLayer.current) {
      updateMarkers();
    }
  }, [towers, selectedTower]);

  const initializeMap = () => {
    if (!mapRef.current || leafletMap.current) return;

    // Nairobi coordinates
    const nairobi = [-1.286389, 36.817223];
    
    leafletMap.current = window.L.map(mapRef.current).setView(nairobi, 12);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap.current);
    
    markersLayer.current = window.L.layerGroup().addTo(leafletMap.current);
    
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!markersLayer.current) return;
    
    markersLayer.current.clearLayers();
    
    towers.forEach(tower => {
      if (tower.latitude && tower.longitude) {
        const status = tower.status;
        const color = statusColors[status].color;
        
        const markerHtml = `
          <div class="marker-pin" style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
            <span style="font-size: 12px;">${towers.indexOf(tower) + 1}</span>
          </div>
        `;
        
        const icon = window.L.divIcon({
          html: markerHtml,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        const marker = window.L.marker([parseFloat(tower.latitude), parseFloat(tower.longitude)], { icon })
          .addTo(markersLayer.current);
          
        // Add a popup with tower info
        marker.bindPopup(`
          <div>
            <h3 class="text-sm font-semibold">${tower.towerId}</h3>
            <p class="text-xs text-gray-600">${tower.location}</p>
            <p class="text-xs mt-1">
              <span class="status-indicator status-${tower.status}"></span>
              ${statusColors[tower.status].label}
            </p>
            <button class="text-xs text-primary mt-2 view-details-btn">View Details</button>
          </div>
        `);
        
        marker.on('popupopen', () => {
          setTimeout(() => {
            const button = document.querySelector('.view-details-btn');
            if (button && onTowerSelect) {
              button.addEventListener('click', () => {
                onTowerSelect(tower);
              });
            }
          }, 10);
        });
        
        // If this is the selected tower, open its popup
        if (selectedTower && selectedTower.id === tower.id) {
          marker.openPopup();
        }
      }
    });
  };

  return (
    <div className="relative">
      <div ref={mapRef} className="map-container bg-gray-100" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md text-sm">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="status-indicator status-active"></span>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <span className="status-indicator status-warning"></span>
            <span>Needs Attention</span>
          </div>
          <div className="flex items-center">
            <span className="status-indicator status-critical"></span>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerMap;
