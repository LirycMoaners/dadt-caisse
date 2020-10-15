import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';

export class DatabaseCollectionService<T extends { id: string }> {
  private datasRef: firebase.database.Reference;
  private datas$: BehaviorSubject<T[]> = new BehaviorSubject([]);

  constructor(
    private readonly database: AngularFireDatabase,
    collectionName: string
  ) {
    this.datasRef = this.database.database.ref(collectionName);
    this.datasRef.on('child_added', (data) => {
      this.datas$.next([...this.datas$.value, data.val()]);
    });
    this.datasRef.on('child_changed', (data) => {
      const newDatas = this.datas$.value;
      newDatas.splice(this.datas$.value.findIndex(d => d.id === data.key), 1, data.val());
      this.datas$.next(newDatas);
    });
    this.datasRef.on('child_removed', (data) => {
      const newDatas = this.datas$.value;
      newDatas.splice(this.datas$.value.findIndex(d => d.id === data.key), 1);
      this.datas$.next(newDatas);
    });
  }

  /**
   * Retourne l'observable des données
   */
  public getAll(): Observable<T[]> {
    return this.datas$;
  }

  /**
   * Appel le service de création d'une donnée
   * @param customer La donnée à ajouter
   */
  public create(data: T): Observable<T> {
    const newDataRef = this.datasRef.push();
    data.id = newDataRef.key;
    return from(newDataRef.set(data)).pipe(flatMap(() => of(data)));
  }

  /**
   * Appel le service de mise à jour d'une donnée
   * @param customer La donnée mise à jour
   */
  public update(data: T): Observable<T> {
    return from(this.datasRef.child(data.id).update(data)).pipe(flatMap(() => of(data)));
  }

  /**
   * Appel le service de suppression d'une donnée
   * @param id Id de la donnée à supprimer
   */
  public delete(id: string): Observable<T> {
    return from(this.datasRef.child(id).remove());
  }

}
