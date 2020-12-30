export class Settings {
  address?: string;
  taxeRate = 0;
  ticketFooter?: string;
  eurosToPoint = 1;
  pointsToEuro = 1;
  pointsForDiscount?: number;
  discount?: number;
  discountType?: '%' | '€';
  contactGroup?: string;
}
