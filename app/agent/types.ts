export interface Villa {
  id: string;
  name: string;
  floor: string;
  capacity: number;
}

export interface AvailabilityResult extends Villa {
  available: boolean;
  booking?: any;
}