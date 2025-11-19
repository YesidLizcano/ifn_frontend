import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordenada } from '../../models/Conglomerado';

// Interface actualizada - onConglomeradoCreado es opcional
interface MapaColombiaProps {
  conglomerados: Coordenada[];
  onConglomeradoCreado?: (coordenada: Coordenada) => void;
}

// Componente para manejar los popups correctamente
const ConglomeradoCircles: React.FC<{ conglomerados: Coordenada[] }> = ({ conglomerados }) => {
  const map = useMap();
  
  return (
    <>
      {conglomerados.map((conglomerado, index) => {
        const numeroConglomerado = index + 1;
        
        return (
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
              click: (e) => {
                L.popup()
                  .setLatLng(e.latlng)
                  .setContent(`
                    <div style="padding: 10px; min-width: 250px;">
                      <strong style="font-size: 14px; color: ${conglomerado.estaEnBosque ? '#2E7D32' : '#d32f2f'};">
                        Conglomerado #${numeroConglomerado}
                      </strong>
                      <br />
                      <small style="color: #666;">ID interno: ${conglomerado.id}</small>
                      <br /><br />
                      <strong>Coordenadas:</strong><br />
                      📍 Lat: ${conglomerado.latitud.toFixed(6)}<br />
                      📍 Lng: ${conglomerado.longitud.toFixed(6)}
                      <br /><br />
                      <strong>Región:</strong> ${conglomerado.region}
                      <br />
                      <strong>Departamento:</strong> ${conglomerado.departamento}
                      <br />
                      <strong>Municipio:</strong> ${conglomerado.municipio}
                      <br />
                      <strong>Tipo:</strong> ${conglomerado.tipo}
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
                      (conglomerado.departamento === 'Mar' ?
                        '<small style="color: #666;"><em>🌊 Este conglomerado está en el mar - No válido para inventario forestal</em></small>' :
                        '<small style="color: #666;"><em>⚠️ Este conglomerado no está en zona boscosa válida</em></small>'
                      ) :
                      '<small style="color: #666;"><em>🌳 Este conglomerado está en zona boscosa válida</em></small>'
                    }
                    </div>
                  `)
                  .openOn(map);
              }
            }}
          />
        );
      })}
    </>
  );
};

const MapaColombia: React.FC<MapaColombiaProps> = ({ conglomerados, onConglomeradoCreado }) => {
  const centroColombia: [number, number] = [4.5709, -74.2973];

  return (
    <div style={{ height: '500px', width: '100%', marginTop: '20px', position: 'relative' }}>
      <MapContainer
        center={centroColombia}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Componente separado para los círculos con acceso al mapa */}
        <ConglomeradoCircles conglomerados={conglomerados} />

        {/* Marcadores adicionales para mejor visibilidad */}
        {conglomerados.map((conglomerado, index) => {
          const numeroConglomerado = index + 1;
          
          return (
            <Marker
              key={`marker-${conglomerado.id}`}
              position={[conglomerado.latitud, conglomerado.longitud]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `
                  <div style="
                    background-color: ${conglomerado.estaEnBosque ? '#4CAF50' : '#f44336'};
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    cursor: pointer;
                  ">
                    ${numeroConglomerado}
                  </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              })}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <strong>Conglomerado #{numeroConglomerado}</strong>
                  <br />
                  <small style={{color: '#666'}}>ID interno: {conglomerado.id}</small>
                  <br /><br />
                  <strong>Coordenadas:</strong><br />
                  Lat: {conglomerado.latitud.toFixed(6)}<br />
                  Lng: {conglomerado.longitud.toFixed(6)}
                  <br />
                  <strong>Ubicación:</strong><br />
                  {conglomerado.municipio}, {conglomerado.departamento}
                  <br />
                  <strong>Región/Tipo:</strong> {conglomerado.tipo}
                  <br />
                  <strong>Estado:</strong><br />
                  <span style={{ 
                    color: conglomerado.estaEnBosque ? 'green' : 'red', 
                    fontWeight: 'bold' 
                  }}>
                    {conglomerado.estaEnBosque ? '✅ Válido (Bosque)' : '❌ No válido'}
                  </span>
                  <br />
                  <strong>Fecha creación:</strong><br />
                  {conglomerado.fechaCreacion.toLocaleString()}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda del mapa */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <strong>Leyenda:</strong><br />
        <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#4CAF50',
            borderRadius: '50%',
            marginRight: '5px'
          }}></div>
          ✅ Válido (bosque)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#f44336',
            borderRadius: '50%',
            marginRight: '5px'
          }}></div>
          ❌ No válido
        </div>
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
          Total: {conglomerados.length} conglomerados
        </div>
      </div>

      {/* Información de estado */}
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
        <strong>Estadísticas:</strong><br />
        <div style={{ color: 'green' }}>
          ✅ Válidos: {conglomerados.filter(c => c.estaEnBosque).length}
        </div>
        <div style={{ color: 'red' }}>
          ❌ No válidos: {conglomerados.filter(c => !c.estaEnBosque).length}
        </div>
      </div>
    </div>
  );
};

export default MapaColombia;