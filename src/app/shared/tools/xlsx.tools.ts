import { Workbook } from 'exceljs';

export class XlsxTools {

  /**
   * Télécharge le workbook en paramètre sous forme de fichier Excel avec le titre donnée en paramètre
   * @param workbook Le workbook à enregistrer
   * @param title Le titre du fichier à enregistrer
   */
  public static saveFile(workbook: Workbook, title: string): void {
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = title;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }
}
