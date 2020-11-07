import { Injectable } from '@angular/core';
import { asyncScheduler, combineLatest, concat, defer, from, Observable, of, ReplaySubject, scheduled } from 'rxjs';
import { concatAll, concatMap, delay, first, map, mergeMap, takeLast } from 'rxjs/operators';
import { Customer } from 'src/app/shared/models/customer.model';
import { CustomerService } from './customer.service';
import { SettingsService } from './settings.service';
import clientKeysProd from '../../../assets/secure/google-client.prod.json';
import clientKeysDev from '../../../assets/secure/google-client.dev.json';
import { environment } from 'src/environments/environment';


@Injectable()
export class GoogleService {
  private GoogleAuth: gapi.auth2.GoogleAuth;
  private customerService: CustomerService;
  private contactGroup: string;
  private onGapiInit: ReplaySubject<void> = new ReplaySubject(1);
  private isSynStarted = false;

  constructor(
    private readonly settingsService: SettingsService
  ) { }

  /**
   * Charge le module client de l'api google puis déclenche l'enchainement des actions
   * @param customerService Le service des clients (pour la synchro des contacts)
   */
  public load(customerService: CustomerService): void {
    this.customerService = customerService;
    gapi.load('client', () => {
      const subscription = this.initClient().pipe(
        mergeMap(() => this.settingsService.getSettings()),
        mergeMap(settings => {
          if (settings.contactGroup) {
            this.contactGroup = settings.contactGroup;
            return this.signIn();
          }
          return of();
        }),
        mergeMap((result) => {
          if (result && !this.isSynStarted) {
            this.isSynStarted = true;
            return this.syncContacts(this.customerService);
          }
          return of();
        }),
      ).subscribe((result) => {
        if (result) {
          subscription.unsubscribe();
        }
      });
    });
  }

  /**
   * Déclenche le processus de connexion d'authorisation d'un utilisateur Google
   */
  public signIn(): Observable<gapi.auth2.GoogleUser> {
    return this.onGapiInit.pipe(
      first(),
      mergeMap(() => {
        if (!this.GoogleAuth.isSignedIn.get()) {
          // User is not signed in. Start Google auth flow.
          return from(this.GoogleAuth.signIn());
        }
        return of(this.GoogleAuth.currentUser.get());
      })
    );
  }

  /**
   * Retourne l'observables des groupes de contact Google
   */
  public getContactGroupList(): Observable<gapi.client.people.ContactGroup[]> {
    return from(gapi.client.people.contactGroups.list()).pipe(
      map(result => result.result.contactGroups)
    );
  }

  /**
   * Synchronise les contacts de Google et les clients de Firebase
   * @param customerService Le service des clients
   */
  public syncContacts(customerService: CustomerService): Observable<unknown> {
    return combineLatest([
      from(
        gapi.client.people.contactGroups.get({
          resourceName: this.contactGroup,
          maxMembers: 10000
        })
      ).pipe(
        mergeMap(result => {
          const ressourceNamesChuncks = [];
          const memberResourceNamesLength = result.result.memberResourceNames ? result.result.memberResourceNames.length : 0;
          for (let i = 0; i < Math.ceil(memberResourceNamesLength / 50); i++) {
            ressourceNamesChuncks.push(result.result.memberResourceNames.splice(0, 50));
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
            (p, result) => [...p, ...result.result.responses.map(response => response.person)],
            []
          );
          return people.map(person => {
            const loyaltyPoints = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Points') : null;
            const createDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Création') : null;
            const updateDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Modification') : null;
            const lastDiscountGaveDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Dernière remise fidélité donnée') : null;
            const lastDiscountUsedDate = person.userDefined ? person.userDefined.find(entry => entry.key === 'Caisse - Dernière remise fidélité utilisée') : null;
            return {
              id: null,
              firstName: person.names ? person.names[0].givenName : '',
              lastName: person.names ? person.names[0].familyName : '',
              emailAddress: person.emailAddresses ? person.emailAddresses[0].value : '',
              phoneNumber: person.phoneNumbers ? person.phoneNumbers[0].value.replace(/\./g, '') : '',
              loyaltyPoints: loyaltyPoints ? Number(loyaltyPoints.value) : 0,
              lastDiscountGaveDate: lastDiscountGaveDate ? new Date(lastDiscountGaveDate.value) : new Date(),
              lastDiscountUsedDate: lastDiscountUsedDate ? new Date(lastDiscountUsedDate.value) : new Date(),
              resourceName: person.resourceName,
              createDate: createDate ? new Date(createDate.value) : new Date(),
              updateDate: updateDate ? new Date(updateDate.value) : new Date(),
              etag: person.metadata.sources[0].etag
            };
          });
        })
      ),
      customerService.getAllOneTime()
    ]).pipe(
      mergeMap(([googleCustomers, firebaseCustomers]: [Customer[], Customer[]]) => {
        firebaseCustomers = firebaseCustomers ? firebaseCustomers : [];
        const customersToAddInFirebase = googleCustomers.filter(
          googleCustomer => firebaseCustomers.every(
            firebaseCustomer => firebaseCustomer.resourceName !== googleCustomer.resourceName
          )
        );
        const customersToUpdateInFirebase = googleCustomers.filter(googleCustomer => {
          const customer = firebaseCustomers.find(
            firebaseCustomer => firebaseCustomer.resourceName
              && firebaseCustomer.resourceName.localeCompare(googleCustomer.resourceName) === 0
              && firebaseCustomer.etag
              && firebaseCustomer.etag.localeCompare(googleCustomer.etag) !== 0
          );
          return !!customer;
        });
        const customersToAddInGoogle = firebaseCustomers.filter(firebaseCustomer =>
          !firebaseCustomer.resourceName
          || googleCustomers.every(googleCustomer => googleCustomer.resourceName !== firebaseCustomer.resourceName)
        );
        const customersToUpdateInGoogle = firebaseCustomers.filter(firebaseCustomer => googleCustomers.some(
          googleCustomer => googleCustomer.resourceName === firebaseCustomer.resourceName
            && (googleCustomer.updateDate as Date).getTime() < (firebaseCustomer.updateDate as Date).getTime()
        ));
        return concat(
          ...customersToAddInFirebase.map(customer => customerService.create(customer, true)),
          ...customersToUpdateInFirebase.map(customer => customerService.update(customer, true)),
          ...customersToAddInGoogle.map(customer => this.createContact(customer).pipe(
            concatMap(person => {
              customer.resourceName = person.resourceName;
              customer.etag = person.metadata.sources[0].etag;
              return customerService.update(customer, true);
            }),
            map(t => t),
            delay(750)
          )),
          ...customersToUpdateInGoogle.map(customer => this.updateContact(customer).pipe(delay(750)))
        );
      }),
      takeLast(1)
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
      resourceName: customer.resourceName,
      personFields: 'metadata'
    })).pipe(
      mergeMap(person => defer(() =>
        gapi.client.people.people.updateContact({
          resourceName: customer.resourceName,
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
      resourceName: customer.resourceName
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
