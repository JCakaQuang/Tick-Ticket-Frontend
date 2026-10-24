export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'user' | 'organizer' | 'admin';
}

export interface TicketTier {
  _id: string;
  name: string;
  type: 'seated' | 'ga' | 'SEATED' | 'GA';
  price: number;
  totalCapacity?: number;
  availableCapacity?: number;
  totalQuantity?: number;
  availableQuantity?: number;
  availableQty?: number;
  description?: string;
  color?: string;
}

export interface Seat {
  _id: string;
  eventId: string;
  tierId: string | TicketTier;
  row: string;
  number?: number;
  col?: number;
  seatCode: string;
  status: 'available' | 'reserved' | 'sold' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'locked' | 'LOCKED';
  reservedUntil?: string | null;
  heldByUserId?: string | null;
  position?: { x: number; y: number };
}

export interface EventVenue {
  name: string;
  address?: string;
  city?: string;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  location?: EventVenue | string;
  venue?: EventVenue;
  venueName?: string;
  city?: string;
  minPrice?: number;
  startingPrice?: number;
  seatingType?: string;
  type?: string;
  bannerUrl: string;
  posterUrl?: string;
  startTime?: string;
  startDate?: string;
  endTime?: string;
  endDate?: string;
  saleStartTime?: string;
  saleEndTime?: string;
  maxTicketsPerUser?: number;
  termsAndConditions?: string;
  status: 'draft' | 'published' | 'closed' | 'DRAFT' | 'PUBLISHED' | 'SALES_OPEN' | 'SALES_CLOSED' | 'ENDED' | 'CANCELLED';
  category?: string;
  organizerId: string;
  tiers?: TicketTier[];
  vnpayQrUrl?: string;
  vnpayTmnCode?: string;
  vnpayAccountName?: string;
  vnpayBankName?: string;
  isSpecial?: boolean;
  specialBadge?: string;
  specialOrder?: number;
  isTrending?: boolean;
  trendingRank?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  tierId: string;
  tierName: string;
  seatId?: string;
  seatCode?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  orderCode?: string;
  userId: string;
  eventId: string | Event;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  finalAmount?: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'expired' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'PAID' | 'paid';
  couponCode?: string;
  paymentGateway?: 'vnpay' | 'momo' | 'mock';
  reservationExpiresAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  ticketCode: string;
  orderId: string;
  eventId?: string | Event;
  event?: Event;
  tierId?: string | TicketTier;
  tier?: TicketTier;
  seatId?: string | Seat;
  seat?: Seat;
  seatCode?: string;
  qrPayload?: string;
  qrToken?: string;
  status: 'valid' | 'used' | 'cancelled' | 'ISSUED' | 'USED' | 'CANCELLED' | 'issued';
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  applicableEvents?: any[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
  action: string;
  targetCollection: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
