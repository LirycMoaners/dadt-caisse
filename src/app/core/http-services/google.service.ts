import { Injectable } from '@angular/core';
import { combineLatest, defer, from, Observable, of, ReplaySubject } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';
import { Customer } from 'src/app/shared/models/customer.model';
import { SettingsService } from './settings.service';
import clientKeysProd from '../../../assets/secure/google-client.prod.json';
import clientKeysDev from '../../../assets/secure/google-client.dev.json';
import { environment } from 'src/environments/environment';
import { Settings } from 'src/app/shared/models/settings.model';


@Injectable()
export class GoogleService {
  private GoogleAuth?: gapi.auth2.GoogleAuth;
  private contactGroup?: string;
  private onGapiInit: ReplaySubject<void> = new ReplaySubject(1);

  constructor(
    private readonly settingsService: SettingsService
  ) { }

  /**
   * Charge le module client de l'api google puis déclenche l'enchainement des actions
   */
  public load(): Observable<gapi.auth2.GoogleUser | undefined> {
    return combineLatest([
      defer(async () =>
        await new Promise<void>((resolve, reject) => gapi.load('client', resolve))
      ).pipe(
        mergeMap(() => this.initClient())
      ),
      this.settingsService.getSettings()
    ]).pipe(
      first(),
      mergeMap(([_, settings]: [void, Settings]) => {
        if (!!settings) {
          this.contactGroup = settings.contactGroup;
          return this.signIn();
        }
        return of(undefined);
      })
    );
  }

  /**
   * Déclenche le processus de connexion d'authorisation d'un utilisateur Google
   */
  public signIn(): Observable<gapi.auth2.GoogleUser> {
    return this.onGapiInit.pipe(
      first(),
      mergeMap(() => {
        if (!this.GoogleAuth?.isSignedIn.get()) {
          // User is not signed in. Start Google auth flow.
          return from((this.GoogleAuth as gapi.auth2.GoogleAuth).signIn());
        }
        return of(this.GoogleAuth?.currentUser.get());
      })
    );
  }

  /**
   * Retourne l'observable des groupes de contact Google
   */
  public getContactGroupList(): Observable<gapi.client.people.ContactGroup[] | undefined> {
    return from(gapi.client.people.contactGroups.list()).pipe(
      map(result => result.result.contactGroups)
    );
  }

  /**
   * Retourne l'obsersable des contacts sous forme de clients
   */
  public getAllContact(): Observable<Customer[]> {
    return from(
      gapi.client.people.contactGroups.get({
        resourceName: this.contactGroup as string,
        maxMembers: 10000
      })
    ).pipe(
      mergeMap(result => {
        const ressourceNamesChuncks = [];
        const memberResourceNamesLength = result.result.memberResourceNames ? result.result.memberResourceNames.length : 0;
        for (let i = 0; i < Math.ceil(memberResourceNamesLength / 50); i++) {
          ressourceNamesChuncks.push((result.result.memberResourceNames as string[]).splice(0, 50));
        }

        return memberResourceNamesLength ? combineLatest(ressourceNamesChuncks.map(ressourceNames =>
          gapi.client.people.people.getBatchGet({
            resourceNames: ressourceNames,
            personFields: 'names,emailAddresses,phoneNumbers,metadata,userDefined'
          })
        )) : of([]);
      }),
      map((results: gapi.client.Response<gapi.client.people.GetPeopleResponse>[]) => {
        const people: gapi.client.people.Person[] = results.reduce(
          (p, result) => [
            ...p,
            ...(result.result.responses as gapi.client.people.PersonResponse[])
              .map(response => response.person as gapi.client.people.Person)
          ],
          [] as gapi.client.people.Person[]
        );
        return people.map(person => {
          const loyaltyPoints = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Points') : null;
          const createDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Création') : null;
          const updateDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Modification') : null;
          const lastDiscountGaveDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Dernière remise fidélité donnée') : null;
          const lastDiscountUsedDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Dernière remise fidélité utilisée') : null;
          return {
            id: null,
            firstName: person.names && person.names[0].givenName ? person.names[0].givenName : '',
            lastName: person.names && person.names[0].familyName ? person.names[0].familyName : '',
            emailAddress: person.emailAddresses && person.emailAddresses[0].value ? person.emailAddresses[0].value : '',
            phoneNumber: person.phoneNumbers && person.phoneNumbers[0].value ? person.phoneNumbers[0].value.replace(/\./g, '') : '',
            loyaltyPoints: loyaltyPoints && loyaltyPoints.value ? Number(loyaltyPoints.value) : 0,
            lastDiscountGaveDate: lastDiscountGaveDate && lastDiscountGaveDate.value ? new Date(lastDiscountGaveDate.value) : new Date(),
            lastDiscountUsedDate: lastDiscountUsedDate && lastDiscountUsedDate.value ? new Date(lastDiscountUsedDate.value) : new Date(),
            resourceName: person.resourceName,
            createDate: createDate && createDate.value ? new Date(createDate.value) : new Date(),
            updateDate: updateDate && updateDate.value ? new Date(updateDate.value) : new Date(),
            etag: person.metadata && person.metadata.sources ? person.metadata.sources[0].etag : ''
          };
        });
      })
    );
  }

  /**
   * Retourne l'observable de la création du contact en paramètre
   * @param customer Le client à créer
   */
  public createContact(customer: Customer): Observable<gapi.client.people.Person> {
    return from(gapi.client.people.people.createContact({
      resource: {
        memberships: [{
          contactGroupMembership: {
            contactGroupResourceName: this.contactGroup
          }
        }],
        names: [{
          givenName: customer.firstName,
          familyName: customer.lastName
        }],
        emailAddresses: [{
          value: customer.emailAddress
        }],
        phoneNumbers: [{
          value: customer.phoneNumber
        }],
        userDefined: [
          {
            key: 'Caisse - Points',
            value: customer.loyaltyPoints.toString(),
          },
          {
            key: 'Caisse - Dernière remise fidélité donnée',
            value: customer.lastDiscountGaveDate as string || 'N/A'
          },
          {
            key: 'Caisse - Dernière remise fidélité utilisée',
            value: customer.lastDiscountUsedDate as string || 'N/A'
          },
          {
            key: 'Caisse - Création',
            value: (customer.createDate as Date).toJSON(),
          },
          {
            key: 'Caisse - Modification',
            value: (customer.updateDate as Date).toJSON(),
          }
        ]
      }
    })).pipe(
      first(),
      map(result => result.result)
    );
  }

  /**
   * Retourne l'observable de la mise à jour du contact en paramètre
   * @param customer Le client à mettre à jour
   */
  public updateContact(customer: Customer): Observable<gapi.client.people.Person> {
    return defer(() => gapi.client.people.people.get({
      resourceName: customer.resourceName as string,
      personFields: 'metadata'
    })).pipe(
      mergeMap(person => defer(() =>
        gapi.client.people.people.updateContact({
          resourceName: customer.resourceName as string,
          updatePersonFields: 'names,emailAddresses,phoneNumbers,userDefined',
          resource: {
            memberships: [{
              contactGroupMembership: {
                contactGroupResourceName: this.contactGroup
              }
            }],
            names: [{
              givenName: customer.firstName,
              familyName: customer.lastName
            }],
            emailAddresses: [{
              value: customer.emailAddress
            }],
            phoneNumbers: [{
              value: customer.phoneNumber
            }],
            userDefined: [
              {
                key: 'Caisse - Points',
                value: customer.loyaltyPoints.toString(),
              },
              {
                key: 'Caisse - Dernière remise fidélité donnée',
                value: customer.lastDiscountGaveDate ? customer.lastDiscountGaveDate as string : 'N/A'
              },
              {
                key: 'Caisse - Dernière remise fidélité utilisée',
                value: customer.lastDiscountUsedDate ? customer.lastDiscountUsedDate as string : 'N/A'
              },
              {
                key: 'Caisse - Création',
                value: (customer.createDate as Date).toJSON(),
              },
              {
                key: 'Caisse - Modification',
                value: (customer.updateDate as Date).toJSON(),
              }
            ],
            etag: person.result.etag
          },

        })
      )),
      map(result => result.result)
    );
  }

  /**
   * Retourne l'observable de la suppression du contact en paramètre
   * @param customer Le client à supprimer
   */
  public deleteContact(customer: Customer): Observable<{}> {
    return from(gapi.client.people.people.deleteContact({
      resourceName: customer.resourceName as string
    })).pipe(
      map(result => result.result)
    );
  }

  /**
   * Initialise le module client des APIs Google avec les paramètres de l'application
   */
  private initClient(): Observable<void> {
    return from(
      gapi.client.init(environment.production ? clientKeysProd : clientKeysDev)
    ).pipe(
      map(() => {
        this.GoogleAuth = gapi.auth2.getAuthInstance();
        this.onGapiInit.next();
      })
    );
  }
}
