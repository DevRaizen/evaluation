import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  user: string | null = null;
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
  }
  constructor(private apiService: ApiService, private router: Router) {
   this.user = sessionStorage.getItem("user");
   if(this.user){
    this.router.navigate(['/dashboard']);
   }else{
    this.router.navigate(['/login']);
   }
  }
  
  ngOnInit() {
    
  }

  onLogin(uname:string,psw:string) {
    this.username = uname;
    this.password = psw;
    this.apiService.loginUser(this.username, this.password).subscribe(
      (response) => {
        if (response.message === 'Login successful') {
          this.router.navigate(['/dashboard']);
          localStorage.setItem('user', response.user);
          localStorage.setItem('userid', response.sessionId);
  // Navigate to dashboard if successful
        } else {
          // If the message is not "Login successful", show the error message
          this.errorMessage = response.message;
          alert(this.errorMessage);
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

