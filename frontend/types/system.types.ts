export interface KpiData {
  title: string;
  value: string;
  trend: string;
  icon: any;
  color: string;
  bg: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface SimpleDictionary {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  origin: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Area {
  id: string;
  name: string;
  capacity: number;
  status: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}
