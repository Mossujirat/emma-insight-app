export interface Device {
  id: string;
  name: string;
  licensePlateId: string;
  phone: string;
  carType: 'BUS' | 'CARGO' | 'TAXI';
  deviceId: string;
  date: Date;
}