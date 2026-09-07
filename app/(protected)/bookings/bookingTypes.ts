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

export interface Booking {
  id: string;

  bookingNumber?: string;

  customerId: string;
  customerName: string;

  phone?: string;

  villa: string;

  checkIn: string;
  checkOut: string;

  guests: number;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  status: string;

  consentStatus?: "Pending" | "Completed";

  bookingGroupId?: string;

  /*
   * Used only by the UI when multiple Firestore
   * booking documents represent one combined stay.
   *
   * Firestore still stores each villa separately.
   */
  sourceBookings?: Booking[];
}