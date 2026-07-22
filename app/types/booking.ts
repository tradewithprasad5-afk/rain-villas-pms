export interface Booking {
  id: string;
  bookingNumber?: string;

  customerName: string;
  villa: string;

  checkIn: string;
  checkOut: string;

  guests: number;

  status: string;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
}