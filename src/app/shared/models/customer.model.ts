import { DatabaseObject } from './database-object.model';

export interface Customer extends DatabaseObject {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  loyaltyPoints: number;
  lastDiscountGaveDate: Date | string | null;
  lastDiscountUsedDate: Date | string | null;
  resourceName: string | undefined;
  etag?: string;
}
