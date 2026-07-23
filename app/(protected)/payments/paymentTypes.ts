export interface Payment {
  id: string;
  receiptNumber?: string;
  bookingNumber: string;
  customerName: string;
  phone?: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  notes?: string;
  createdAt?: any;
}

export interface Booking {
  id: string;

  bookingNumber: string;
  customerId: string;
  customerName: string;

  phone?: string;

  villa: string;

  checkIn?: string;
  checkOut?: string;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
}

export interface Customer {
  phone?: string;
}