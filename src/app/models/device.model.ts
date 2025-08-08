export interface Device {
  id: number;
  car_id: string;
  device_id: string;
  Drivername: string;
  license: string;
  phonecall: string;
  cartype: 'BUS' | 'CARGO' | 'TAXI';
}