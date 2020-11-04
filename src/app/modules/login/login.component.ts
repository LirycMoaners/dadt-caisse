import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/http-services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public errorMessage: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Connecte l'utilisateur à l'application
   */
  public signIn(): void {
    if (this.loginForm.valid) {
      this.authenticationService.signIn(this.loginForm.value.email, this.loginForm.value.password).then(
        () => this.router.navigate(['/cash-register']),
        () => this.errorMessage = 'Email ou mot de passe incorrecte'
      );
    }
  }

}
