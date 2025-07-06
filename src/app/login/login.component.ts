import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  rememberMe: boolean = false; 
  Email!: string;
  Password!: string;
  errorMessage?: string;
  user: string | null = null;
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
  }
  constructor(private sharedService: SharedService, private router: Router) {
   const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;

              switch (userType) {
                case 'student':
                  this.sharedService.Student = parsedUser;
                  this.router.navigate(['/stdashboard']);
                  break;
                case 'admin':
                  this.sharedService.Admin = parsedUser;
                  this.router.navigate(['/dashboard']);
                  break;
                case 'teacher':
                  this.sharedService.Teacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                default:
            
                  this.router.navigate(['/login']);
                  break;
              }

            } catch (e) {
              console.error('Error parsing user from storage:', e);
              this.router.navigate(['/login']);
            }
          } else {
            // No user found
            this.router.navigate(['/login']);
          }
  }
  
  goToReg() {
  this.router.navigate(['/user']);
}

  ngOnInit() {
    
  }

  onSubmit(form: NgForm) {
        if (form.invalid) {
          Object.values(form.controls).forEach(control => {
            control.markAsTouched();
          });
          return;
        }
         this.sharedService.loginUser(this.Email, this.Password,this.rememberMe).subscribe(
            (response) => {
              if (response.status === 'success') {
                const userType = response.accountInfo.UserType;
                const userData = response.accountInfo;

                  if (this.rememberMe) {
                    localStorage.setItem('user', JSON.stringify(response.accountInfo));
                  } else {
                    sessionStorage.setItem('user', JSON.stringify(response.accountInfo));
                  }

                  if (userType === 'student') {
                    this.sharedService.Student = userData;
                    this.router.navigate(['/stdashboard']);
                    
                  } else if (userType === 'admin') {
                    this.sharedService.Admin = userData;
                    this.router.navigate(['/dashboard']);
                  } else if (userType === 'teacher') {
                    this.sharedService.Teacher = userData;
                    this.router.navigate(['/tdashboard']);
                  }

              } else {

                this.errorMessage = response.message;
                
              }
            },
            (error) => {
              // Handle error if the login request fails
              console.error('Error during login:', error);
              this.errorMessage = 'Login failed. Please try again.';
              alert(this.errorMessage); // Display the error message to the user
            }
          );       
      }

}

