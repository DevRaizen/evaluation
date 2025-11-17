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
  errorMessage?: string;
  showPassword = false;
  showconPassword = false;
  Fname?: string;
  Mname?: string;
  Lname?: string;  
  StudId?: string;
  Grade?: string;
  Section?: string;
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
      const email = this.Email?.trim().toLowerCase();
      const isGmail = email?.endsWith('@gmail.com');
      const passwordMatch = this.Password === this.conPassword;
      const passwordLengthOk = this.Password!.length >= 8;

      if (!isGmail) {
        this.errorMessage = 'Only @gmail.com addresses are allowed.';
        return;
      }

       if (!passwordMatch) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      if (!passwordLengthOk) {
        this.errorMessage = 'Password must be at least 8 characters.';
        return;
      }

      this.sharedService.checkEmailExists(this.Email!).subscribe(response => {
          if (response.exists) {
          this.errorMessage = "Email already exists!";
          }else
              {
                this.sharedService.Student.Email = this.Email;
                this.sharedService.Student.Password = this.Password;
                const code = this.generateCode();

                this.sharedService.sendVerificationEmail(this.Email!, code).subscribe({
                next: (res: any) => {
                if (res.success) {
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
              });
        
     /* if(this.Password && this.conPassword && this.Password === this.conPassword && this.Password.length >= 8 && this.Email?.includes('@gmail.com') )
        {
          this.sharedService.checkEmailExists(this.Email!).subscribe(response => {
          if (response.exists) {
          this.errorMessage = "Email already exists!";
          }else
              {
                this.sharedService.Student.Email = this.Email;
                this.sharedService.Student.Password = this.Password;
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
              });
        }else if(this.Password!.length < 8 && this.conPassword!.length < 8){
            this.errorMessage = "Password atleast 8 characters!";
        }else{
            this.errorMessage = "Password not Match!";
        }
      */
    }
      goToReg() {
  this.router.navigate(['/user']);
}
  
}
