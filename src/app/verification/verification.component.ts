import { Component } from '@angular/core';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification',
  standalone: false,
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {
Email?: string;
Otp1?: string;
Otp2?: string;
Otp3?: string;
Otp4?: string;
Otp5?: string;
Otp6?: string;


submitted: boolean = false;

constructor(private sharedService:SharedService, private router:Router){
  this.Email = this.sharedService.Email;
}

moveFocus(value?: string, nextInput?: any) {
  if (value && value.length === 1) {
    nextInput.focus();
  }
}

verifyOtp() {
  this.submitted = true;

  const enteredCode = [this.Otp1, this.Otp2, this.Otp3, this.Otp4, this.Otp5, this.Otp6]
  .map(val => val || '')
  .join('');

  const storedCode = localStorage.getItem('verificationCode');
  localStorage.clear();
  if (!this.Otp1 || !this.Otp2 || !this.Otp3 || !this.Otp4 || !this.Otp5 || !this.Otp6) {
    setTimeout(() => this.submitted = false, 500);
    return;
  }

  if (enteredCode === storedCode) {
    alert('✅ Code verified!');
    this.sharedService.sendUserInfoToDB().subscribe({
      next: (res)=>{
        alert('✅ User data saved to database!');
        this.router.navigate(['/login']);
      },
      error: (err) =>{
        console.error('❌ Failed to save:', err);
        alert('❌ Error saving data.');
      }
    });
    this.router.navigate(['/success']); // or next step
  } else {
    alert('❌ Code mismatch!');
  }
}
}
