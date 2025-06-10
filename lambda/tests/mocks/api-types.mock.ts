// Mock API types
export interface Estacion {
  id: string;
  nombre: string;
  ramal: string;
}

export interface Ramal {
  id: string;
  nombre: string;
  estaciones: string[];
}

export interface Arribo {
  ramal: string;
  estacionOrigen: string;
  estacionDestino: string;
  horaSalida: string;
  horaLlegada: string;
  servicioId: string;
  fechaServicio: string;
}

// Add any other types needed for tests
