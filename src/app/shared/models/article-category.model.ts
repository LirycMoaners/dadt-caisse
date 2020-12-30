import { DatabaseObject } from './database-object.model';

export interface ArticleCategory extends DatabaseObject {
  label: string;
}
