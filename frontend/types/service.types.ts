export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  created_at?: string;
}
