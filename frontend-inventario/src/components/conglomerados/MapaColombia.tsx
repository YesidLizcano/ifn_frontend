import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordenada, zonasBosqueColombia, areasMaritimas } from '../../models/Conglomerado';

interface MapaColombiaProps {
  onConglomeradoCreado: (coordenada: Coordenada) => void;
  conglomerados: Coordenada[];
}

const MapaColombia: React.FC<MapaColombiaProps> = ({ onConglomeradoCreado, conglomerados }) => {
  const centroColombia: [number, number] = [4.5709, -74.2973];
  const [ultimoClick, setUltimoClick] = useState<{lat: number, lng: number} | null>(null);

  // Función MEJORADA para validar - detecta mar y zonas boscosas correctamente
  const validarUbicacion = (lat: number, lng: number): {estaEnBosque: boolean, region: string} => {
    // Primero verificar si está en área marítima
    for (const area of areasMaritimas) {
      const { bounds, nombre } = area;
      if (lat >= bounds.lat[0] && lat <= bounds.lat[1] && 
          lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
        return { estaEnBosque: false, region: `Mar ${nombre}` };
      }
    }

    // Luego verificar si está en zona boscosa
    for (const zona of zonasBosqueColombia) {
      const { bounds, nombre } = zona;
      if (lat >= bounds.lat[0] && lat <= bounds.lat[1] && 
          lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
        return { estaEnBosque: true, region: nombre };
      }
    }

    // Si no está en mar ni en bosque, es tierra pero no boscosa
    return { estaEnBosque: false, region: 'Tierra no boscosa' };
  };

  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setUltimoClick({ lat, lng });
        
        const validacion = validarUbicacion(lat, lng);

        const nuevoConglomerado: Coordenada = {
          id: Date.now(),
          latitud: parseFloat(lat.toFixed(6)),
          longitud: parseFloat(lng.toFixed(6)),
          region: validacion.region,
          estaEnBosque: validacion.estaEnBosque,
          fechaCreacion: new Date()
        };

        onConglomeradoCreado(nuevoConglomerado);

        // Mostrar mensaje informativo según la validación
        if (!validacion.estaEnBosque) {
          if (validacion.region.includes('Mar')) {
            alert('🌊 Conglomerado creado en el MAR.\n\nEste conglomerado se marcará en ROJO porque no es válido para inventario forestal.');
          } else {
            alert('⚠️ Conglomerado creado FUERA de zona boscosa.\n\nEste conglomerado se marcará en ROJO para indicar que no está en un área forestal válida.');
          }
        } else {
          alert('✅ Conglomerado creado en zona boscosa VÁLIDA.\n\nEste conglomerado se marcará en VERDE.');
        }
      },
    });
    return null;
  }

  return (
    <div style={{ height: '500px', width: '100%', marginTop: '20px', position: 'relative' }}>
      {/* Indicador de última ubicación clickeada */}
      {ultimoClick && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          <strong>Último click:</strong><br />
          Lat: {ultimoClick.lat.toFixed(4)}<br />
          Lng: {ultimoClick.lng.toFixed(4)}<br />
          {validarUbicacion(ultimoClick.lat, ultimoClick.lng).estaEnBosque ? 
            '✅ Zona boscosa válida' : '❌ No válido'
          }
        </div>
      )}

      <MapContainer 
        center={centroColombia} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler />
        
        {/* Círculos para conglomerados - VERDE para válidos, ROJO para no válidos */}
        {conglomerados.map((conglomerado) => (
          <Circle
            key={conglomerado.id}
            center={[conglomerado.latitud, conglomerado.longitud]}
            radius={15000}
            pathOptions={conglomerado.estaEnBosque ? {
              // Estilo para conglomerados VÁLIDOS (en zona boscosa)
              fillColor: '#4CAF50',
              color: '#2E7D32',
              fillOpacity: 0.4,
              opacity: 0.8,
              weight: 3
            } : {
              // Estilo para conglomerados NO VÁLIDOS (mar o fuera de bosque)
              fillColor: '#f44336',
              color: '#c62828',
              fillOpacity: 0.3,
              opacity: 0.7,
              weight: 2,
              dashArray: '5, 5'
            }}
            eventHandlers={{
              click: () => {
                const popup = L.popup()
                  .setLatLng([conglomerado.latitud, conglomerado.longitud])
                  .setContent(`
                    <div style="padding: 10px; min-width: 250px;">
                      <strong style="font-size: 14px; color: ${conglomerado.estaEnBosque ? '#2E7D32' : '#d32f2f'};">
                        Conglomerado #${conglomerado.id}
                      </strong>
                      <br /><br />
                      <strong>Coordenadas:</strong><br />
                      📍 Lat: ${conglomerado.latitud}<br />
                      📍 Lng: ${conglomerado.longitud}
                      <br /><br />
                      <strong>Región:</strong> ${conglomerado.region}
                      <br />
                      <strong>Estado:</strong> 
                      ${conglomerado.estaEnBosque ? 
                        '<span style="color: green; font-weight: bold;">✅ EN ZONA BOSCOSA</span>' : 
                        '<span style="color: red; font-weight: bold;">❌ NO VÁLIDO</span>'
                      }
                      <br />
                      <strong>Fecha:</strong> ${conglomerado.fechaCreacion.toLocaleDateString()}
                      <br /><br />
                      ${!conglomerado.estaEnBosque ? 
                        (conglomerado.region.includes('Mar') ?
                          '<small style="color: #666;"><em>🌊 Este conglomerado está en el mar - No válido para inventario forestal</em></small>' :
                          '<small style="color: #666;"><em>⚠️ Este conglomerado no está en zona boscosa válida</em></small>'
                        ) : 
                        '<small style="color: #666;"><em>🌳 Este conglomerado está en zona boscosa válida</em></small>'
                      }
                    </div>
                  `)
                  .openOn(document.querySelector('.leaflet-container') as any);
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaColombia;