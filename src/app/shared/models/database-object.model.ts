export class DatabaseObject {
  id: string | null = null;
  createDate: Date | string;
  updateDate: Date | string;

  constructor() {
    this.createDate = new Date();
    this.updateDate = new Date();
  }
}
