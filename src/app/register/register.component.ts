import { Component } from '@angular/core';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  showPassword = false;
  showconPassword = false;
  Fname?: string;
  Mname?: string;
  Lname?: string;  
  StudId?: string;
  Grade?: string;
  Section?: string;
  PhoneNumber?: string;
  Email?: string;
  Password?: string;
  conPassword?: string;

  constructor(private sharedService:SharedService,private router: Router){

  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
  }
  toggleconPasswordVisibility(): void {
    this.showconPassword = !this.showconPassword;
    
  }

  generateCode(length: number = 6): string {
    
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  onSubmit(form: NgForm) {
      if (form.invalid) {
        // Show validation errors
        Object.values(form.controls).forEach(control => {
          control.markAsTouched();
        });
        return;
      }
      this.sharedService.Email = this.Email;
      this.sharedService.Password = this.Password;
      const code = this.generateCode();

        this.sharedService.sendVerificationEmail(this.Email!, code).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Verification code sent to your email!');
          localStorage.setItem('verificationCode', code);
          this.router.navigate(['/verification']);
        } else {
          alert('Failed to send email: ' + res.message);
        }
      },
      error: (err) => {
        alert('Error sending email');
        console.error(err);
      }
    });
      
      this.router.navigate(['/verification']);  
      
    }
  
}
