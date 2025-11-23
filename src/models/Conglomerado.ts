export interface Coordenada {
  id: number;
  latitud: number;
  longitud: number;
  region: string;          // puede seguir existiendo
  departamento: string;    // nuevo
  municipio: string;       // nuevo
}

export interface ConglomeradoForm {
  cantidad: string;
  confirmado: boolean;
}

// Zonas boscosas REALISTAS de Colombia (solo tierra)
export const zonasBosqueColombia = [
  // Amazonía Colombiana
  { 
    nombre: 'Amazonía', 
    departamento: 'Amazonas', 
    municipio: 'Leticia',
    coordenadas: [
      [-1.0, -73.0], [-1.0, -70.0], [-2.5, -70.0], [-2.5, -72.0],
      [-3.0, -72.0], [-3.0, -73.0], [-1.0, -73.0]
    ] as [number, number][],
    bounds: { lat: [-3.0, -1.0], lng: [-73.0, -70.0] }
  },
  // Pacífico Colombiano (solo tierra)
  { 
    nombre: 'Pacífico', 
    departamento: 'Chocó', 
    municipio: 'Quibdó',
    coordenadas: [
      [2.5, -78.0], [2.5, -76.5], [4.0, -76.5], [4.0, -77.5],
      [5.0, -77.5], [5.0, -78.0], [2.5, -78.0]
    ] as [number, number][],
    bounds: { lat: [2.5, 5.0], lng: [-78.0, -76.5] }
  },
  // Andes Colombianos
  { 
    nombre: 'Andes', 
    departamento: 'Cundinamarca', 
    municipio: 'Bogotá',
    coordenadas: [
      [1.5, -78.0], [1.5, -74.0], [4.0, -74.0], [4.0, -75.0],
      [6.0, -75.0], [6.0, -76.0], [7.0, -76.0], [7.0, -78.0],
      [1.5, -78.0]
    ] as [number, number][],
    bounds: { lat: [1.5, 7.0], lng: [-78.0, -74.0] }
  },
  // Caribe Colombiano (solo tierra)
  { 
    nombre: 'Caribe', 
    departamento: 'Atlántico', 
    municipio: 'Barranquilla',
    coordenadas: [
      [8.0, -76.5], [8.0, -74.0], [9.5, -74.0], [9.5, -75.0],
      [10.5, -75.0], [10.5, -76.5], [8.0, -76.5]
    ] as [number, number][],
    bounds: { lat: [8.0, 10.5], lng: [-76.5, -74.0] }
  },
  // Orinoquía
  { 
    nombre: 'Orinoquía', 
    departamento: 'Meta', 
    municipio: 'Villavicencio',
    coordenadas: [
      [3.0, -73.0], [3.0, -71.0], [5.0, -71.0], [5.0, -72.0],
      [6.0, -72.0], [6.0, -73.0], [3.0, -73.0]
    ] as [number, number][],
    bounds: { lat: [3.0, 6.0], lng: [-73.0, -71.0] }
  }
];

// Áreas marítimas de Colombia que deben ser consideradas NO válidas
export const areasMaritimas = [
  // Océano Pacífico - coordenadas más precisas
  { 
    nombre: 'Océano Pacífico', 
    bounds: { 
      lat: [-4.0, 8.0],     // Desde sur hasta norte de Colombia
      lng: [-85.0, -77.0]   // Desde costa hacia el oeste
    } 
  },
  // Mar Caribe - coordenadas más precisas
  { 
    nombre: 'Mar Caribe', 
    bounds: { 
      lat: [8.0, 15.0],     // Desde norte de Colombia hasta más al norte
      lng: [-82.0, -71.0]   // Desde Panamá hasta Venezuela
    } 
  }
];
