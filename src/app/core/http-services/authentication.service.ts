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
  public user$: Observable<firebase.User>;

  constructor(
    private readonly fireAuth: AngularFireAuth
  ) {
    this.user$ = this.fireAuth.user;
  }

  /**
   * Log in with email & password
   */
  public signIn(email: string, password: string) {
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
  public signInWithGoogle() {
    return new Promise<any>((resolve, reject) =>
      this.fireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(
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
  public signOut() {
    return this.fireAuth.signOut();
  }
}
