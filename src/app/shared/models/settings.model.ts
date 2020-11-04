export class Settings {
  address: string;
  taxeRate: number;
  ticketFooter: string;
  eurosToPoint: number;
  pointsToEuro: number;
  pointsForDiscount: number;
  discount: number;
  discountType: '%' | '€';
  contactGroup?: string;
}
