export interface Booking {
  id: string;
  bookingNumber: string;
  customerId?: string;
  customerName: string;
  villa: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: string;
}

export interface Villa {
  id: string;
  name: string;
  capacity: number;
  rate: number;
  image: string;
}