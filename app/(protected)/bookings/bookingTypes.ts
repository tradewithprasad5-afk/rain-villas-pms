export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  bookingNumber?: string;

  villa: string;
  checkIn: string;
  checkOut: string;

  guests: number;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  status: string;
  consentStatus?: "Pending" | "Completed";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;

  totalBookings?: number;
  totalSpent?: number;
  lastStay?: string;
}