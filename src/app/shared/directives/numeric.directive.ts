import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumeric]'
})
export class NumericDirective {
  @Input() decimals = 0;

  constructor(private el: ElementRef) {}

  /**
   * Vérifie que la valeur respecte le template d'un nombre avec le nombre de décimales en paramètre de la directive
   * @param value La valeur à vérifier
   */
  private check(value: string): RegExpMatchArray {
      if (this.decimals <= 0) {
          return String(value).match(new RegExp(/^-?\d?$/));
      } else {
          const regExpString =
              '^\\s*((-?\\d+([\\.|\\,]\\d{0,' +
              this.decimals +
              '})?)|(-?\\d*([\\.|\\,]\\d{1,' +
              this.decimals +
              '})?))\\s*$';
          return String(value).match(new RegExp(regExpString));
      }
  }

  /**
   * Lance la vérification de la nouvelle valeur du champ
   * @param oldValue L'ancienne valeur du champ devant être remise dans le champ si la vérification échoue
   */
  private run(oldValue: number): void {
      setTimeout(() => {
          const currentValue: string = this.el.nativeElement.value;
          if (currentValue !== '' && !this.check(currentValue)) {
              this.el.nativeElement.value = oldValue;
          }
      });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
      this.run(this.el.nativeElement.value);
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
      this.run(this.el.nativeElement.value);
  }

}
