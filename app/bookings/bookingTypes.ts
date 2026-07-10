export interface Booking {
  id?: string;
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