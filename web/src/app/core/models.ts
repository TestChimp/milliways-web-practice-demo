export interface DemoUser {
  id: number;
  email: string;
}

export interface AuthSession {
  user: DemoUser;
  token: string;
}

export interface MenuItemDto {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  color?: string;
  imageName?: string;
}

export interface MenuItem {
  id: number;
  section?: string;
  name: string;
  description: string;
  price: number;
  color?: string;
  imageName?: string;
}

export function menuItemFromDto(dto: MenuItemDto, section?: string): MenuItem {
  return {
    id: dto.id,
    section,
    name: dto.name,
    description: dto.description,
    price: dto.priceCents / 100,
    color: dto.color,
    imageName: dto.imageName,
  };
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export type SpiceLevel = 'MILD' | 'MEDIUM' | 'HOT' | 'SUPERNOVA';
export type DeliveryMethod = 'STANDARD' | 'EXPRESS' | 'TELEPORT' | 'PICKUP';
export type Planet = 'EARTH' | 'MAGRATHEA' | 'BETELGEUSE_V' | 'SANTRAGINUS_V' | 'KRIKKIT';
export type PaymentMethod = 'CARD' | 'BABEL_FISH_CREDITS' | 'GALACTIC_EXPRESS' | 'CASH_ON_DELIVERY';

export const SPICE_LEVELS: SpiceLevel[] = ['MILD', 'MEDIUM', 'HOT', 'SUPERNOVA'];
export const DELIVERY_METHODS: { value: DeliveryMethod; label: string }[] = [
  { value: 'STANDARD', label: 'Standard (45 min)' },
  { value: 'EXPRESS', label: 'Express (20 min, +₭8)' },
  { value: 'TELEPORT', label: 'Teleport (instant, +₭15)' },
  { value: 'PICKUP', label: 'Pick up at the restaurant' },
];
export const PLANETS: { value: Planet; label: string }[] = [
  { value: 'EARTH', label: 'Earth' },
  { value: 'MAGRATHEA', label: 'Magrathea' },
  { value: 'BETELGEUSE_V', label: 'Betelgeuse V' },
  { value: 'SANTRAGINUS_V', label: 'Santraginus V' },
  { value: 'KRIKKIT', label: 'Krikkit' },
];
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CARD', label: 'Card' },
  { value: 'BABEL_FISH_CREDITS', label: 'Babel Fish credits (5% off)' },
  { value: 'GALACTIC_EXPRESS', label: 'Galactic Express' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on delivery' },
];
export const TIP_PERCENTS = [0, 10, 15, 20];

export interface CartLine {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  spiceLevel?: SpiceLevel;
}

export interface CheckoutOptions {
  deliveryMethod: DeliveryMethod;
  planet: Planet;
  address: string;
  instructions: string;
  paymentMethod: PaymentMethod;
  tipPercent: number;
  couponCode: string;
}

export interface CreateOrderItem {
  menuItemId: number;
  quantity: number;
  spiceLevel?: SpiceLevel;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  delivery: { method: DeliveryMethod; planet: Planet; address?: string; instructions?: string };
  payment: { method: PaymentMethod; tipPercent: number };
  couponCode?: string;
}

export interface BackendOrder {
  id: number;
  status: string;
  totalCents: number;
  breakdown?: { subtotalCents: number; deliveryFeeCents: number; discountCents: number; tipCents: number };
  delivery?: { method: DeliveryMethod; planet: Planet; address?: string; estimatedMinutes: number };
  payment?: { method: PaymentMethod; tipPercent: number };
  couponCode?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendOrderStatus {
  id: number;
  status: string;
  deliveryMethod?: DeliveryMethod;
  estimatedMinutes?: number;
  updatedAt: string;
}
