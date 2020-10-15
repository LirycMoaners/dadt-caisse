export class NumberTools {

  /**
   * Convertie la valeur en nombre
   * @param value La valeur à convertir
   */
  public static toNumber(value: string): number {
    return Number(value.replace(',', '.'));
  }
}
