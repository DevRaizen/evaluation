import { Component } from '@angular/core';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';

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
  Schoolid?: string;
  Grade?: string;
  Section?: string;
  PhoneNumber?: string;
  
  constructor(private shared:SharedService,private router: Router){
    this.Fname = this.shared.Fname;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
  }
  toggleconPasswordVisibility(): void {
    this.showconPassword = !this.showconPassword;
    
  }
}
