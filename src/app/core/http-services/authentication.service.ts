import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

/**
 * Service for every action about authentication & account
 *
 * @export
 */
@Injectable()
export class AuthenticationService {

  /**
   * Current logged in user
   */
  public user$: Observable<firebase.default.User | null>;

  constructor(
    private readonly fireAuth: AngularFireAuth
  ) {
    this.user$ = this.fireAuth.user;
  }

  /**
   * Log in with email & password
   */
  public signIn(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) =>
      this.fireAuth.signInWithEmailAndPassword(email, password).then(
        res => {
          resolve(res);
        }, error => {
          reject(error);
        }
      )
    );
  }

  /**
   * Log in with Google account
   */
  public signInWithGoogle(): Promise<any> {
    return new Promise<any>((resolve, reject) =>
      this.fireAuth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider()).then(
        res => {
          resolve(res);
        }, error => {
          reject(error);
        }
      )
    );
  }

  /**
   * Log out
   */
  public signOut(): Promise<void> {
    return this.fireAuth.signOut();
  }
}
