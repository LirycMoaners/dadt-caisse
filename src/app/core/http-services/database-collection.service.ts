import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { from, Observable, of, ReplaySubject } from 'rxjs';
import { delay, map, mergeMap } from 'rxjs/operators';
import { DatabaseObject } from 'src/app/shared/models/database-object.model';
import { AuthenticationService } from './authentication.service';

export class DatabaseCollectionService<T extends DatabaseObject> {
  private datasRef: AngularFireList<T>;
  private $datas: ReplaySubject<T[]> = new ReplaySubject(1);

  constructor(
    private readonly database: AngularFireDatabase,
    private readonly authenticationService: AuthenticationService,
    collectionName: string
  ) {
    this.datasRef = this.database.list(collectionName);
    this.authenticationService.user$.pipe(
      mergeMap((user) => !!user ? this.datasRef.snapshotChanges() : of(null)),
      delay(0),
      map(changes => !!changes ? changes.map(c => {
        const data = {...c.payload.val(), id: c.payload.key} as T;
        data.createDate = new Date(data.createDate);
        data.updateDate = new Date(data.updateDate);
        return data;
      }) : undefined)
    ).subscribe(datas => this.$datas.next(datas));
  }

  /**
   * Retourne le stream des données
   */
  public getAll(): Observable<T[]> {
    return this.$datas;
  }


  /**
   * Retourne l'observable des données
   */
  public getAllOneTime(): Observable<T[] | undefined> {
    return from(this.datasRef.query.once('value')).pipe(
      map((data) => data.val() ? Object.entries(data.val() as T).map((entry: [string, T]) => ({
        ...entry[1],
        id: entry[0],
        createDate: new Date(entry[1].createDate),
        updateDate: new Date(entry[1].updateDate)
      } as T)) : undefined)
    );
  }

  /**
   * Retourne l'observable de la donnée dont l'id est en paramètre
   */
  public get(id: string): Observable<T> {
    return this.getAll().pipe(map(datas => datas.find(data => data.id === id) as T));
  }

  /**
   * Appel le service de création d'une donnée
   * @param customer La donnée à ajouter
   */
  public create(data: T): Observable<T> {
    const dataToCreate = {...data};
    dataToCreate.createDate = (dataToCreate.createDate as Date).toJSON();
    dataToCreate.updateDate = (dataToCreate.updateDate as Date).toJSON();
    const newDataRef = this.datasRef.push(dataToCreate);
    return from(newDataRef).pipe(
      mergeMap(() => {
        dataToCreate.id = !!newDataRef.key ? newDataRef.key : null;
        dataToCreate.createDate = new Date(data.createDate);
        dataToCreate.updateDate = new Date(data.updateDate);
        return of(data);
      })
    );
  }

  /**
   * Appel le service de mise à jour d'une donnée
   * @param customer La donnée mise à jour
   */
  public update(data: T): Observable<T> {
    const dataToUpdate = {...data};
    dataToUpdate.id = null;
    dataToUpdate.createDate = (dataToUpdate.createDate as Date).toJSON();
    dataToUpdate.updateDate = (dataToUpdate.updateDate as Date).toJSON();
    return from(this.datasRef.update(data.id as string, dataToUpdate)).pipe(
      mergeMap(() => {
        dataToUpdate.id = data.id;
        dataToUpdate.createDate = new Date(data.createDate);
        dataToUpdate.updateDate = new Date(data.updateDate);
        return of(dataToUpdate);
      })
    );
  }

  /**
   * Appel le service de suppression d'une donnée
   * @param id Id de la donnée à supprimer
   */
  public delete(data: T): Observable<void> {
    return from(this.datasRef.remove(data.id as string));
  }
}
