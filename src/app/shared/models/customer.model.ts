import { DatabaseObject } from './database-object.model';

export class Customer extends DatabaseObject {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  loyaltyPoints: number;
}
