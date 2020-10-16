import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DatabaseObject } from 'src/app/shared/models/database-object.model';

export class DatabaseCollectionService<T extends DatabaseObject> {
  private datasRef: firebase.database.Reference;
  private datas$: BehaviorSubject<T[]> = new BehaviorSubject([]);

  constructor(
    private readonly database: AngularFireDatabase,
    collectionName: string
  ) {
    this.datasRef = this.database.database.ref(collectionName);
    this.datasRef.on('child_added', (data) => {
      const value = data.val() as T;
      value.createDate = new Date(value.createDate);
      value.updateDate = new Date(value.updateDate);
      this.datas$.next([...this.datas$.value, value]);
    });
    this.datasRef.on('child_changed', (data) => {
      const value = data.val() as T;
      value.createDate = new Date(value.createDate);
      value.updateDate = new Date(value.updateDate);
      const newDatas = this.datas$.value;
      newDatas.splice(this.datas$.value.findIndex(d => d.id === data.key), 1, value);
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
    data.createDate = (data.createDate as Date).toJSON();
    data.updateDate = (data.updateDate as Date).toJSON();
    return from(newDataRef.set(data)).pipe(
      mergeMap(() => {
        data.createDate = new Date(data.createDate);
        data.updateDate = new Date(data.updateDate);
        return of(data);
      })
    );
  }

  /**
   * Appel le service de mise à jour d'une donnée
   * @param customer La donnée mise à jour
   */
  public update(data: T): Observable<T> {
    data.createDate = (data.createDate as Date).toJSON();
    data.updateDate = (data.updateDate as Date).toJSON();
    return from(this.datasRef.child(data.id).update(data)).pipe(
      mergeMap(() => {
        data.createDate = new Date(data.createDate);
        data.updateDate = new Date(data.updateDate);
        return of(data);
      })
    );
  }

  /**
   * Appel le service de suppression d'une donnée
   * @param id Id de la donnée à supprimer
   */
  public delete(id: string): Observable<T> {
    return from(this.datasRef.child(id).remove());
  }

}
