export class MathTools {
  /**
   * Retourne le résultat de l'addition des deux chiffres en paramètre
   * @param firstNumber Le premier chiffre à additioner
   * @param secondNumber Le deuxième chiffre à additioner
   */
  public static sum(firstNumber: number, secondNumber: number): number {
    if (!firstNumber && !secondNumber) {
      return 0;
    } else if (!firstNumber) {
      return secondNumber;
    } else if (!secondNumber) {
      return firstNumber;
    }
    let sumString = Math.round(Math.round(firstNumber * 100) + Math.round(secondNumber * 100)).toString();
    const isNegativ = sumString.includes('-');
    if (isNegativ) {
      sumString = sumString.replace('-', '');
    }
    if (sumString.length < 1) {
      sumString = '000';
    } else if (sumString.length < 2) {
      sumString = '00' + sumString;
    } else if (sumString.length < 3) {
      sumString = '0' + sumString;
    }
    return Number(
      (isNegativ ? '-' : '')
      + sumString.substring(0, sumString.length - 2)
      + '.'
      + sumString.substring(sumString.length - 2, sumString.length)
    );
  }

  /**
   * Retourne le résultat de la multiplication des deux chiffres en paramètre
   * @param firstNumber Le premier chiffre à mulitplier
   * @param secondNumber Le deuxième chiffre à multiplier
   */
  public static multiply(firstNumber: number, secondNumber: number): number {
    let multiplyString = Math.round(Math.round(firstNumber * 100) * Math.round(secondNumber * 100)).toString();
    const isNegativ = multiplyString.includes('-');
    if (isNegativ) {
      multiplyString = multiplyString.replace('-', '');
    }
    if (multiplyString.length === 1) {
      multiplyString = '00000' + multiplyString;
    } else if (multiplyString.length === 2) {
      multiplyString = '000' + multiplyString;
    } else if (multiplyString.length === 3) {
      multiplyString = '00' + multiplyString;
    } else if (multiplyString.length === 4) {
      multiplyString = '0' + multiplyString;
    }
    return Number(
      (isNegativ ? '-' : '')
      + multiplyString.substring(0, multiplyString.length - 4)
      + '.'
      + multiplyString.substring(multiplyString.length - 4, multiplyString.length - 2)
    );
  }
}
