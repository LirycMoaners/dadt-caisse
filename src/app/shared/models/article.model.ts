import { DatabaseObject } from './database-object.model';

export class Article extends DatabaseObject {
  reference: string;
  label: string;
  categoryId: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
}
