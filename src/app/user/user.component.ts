import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  Fname = '';
  Mname = '';
  Lname = '';
  StudId = '';
  Grade = '';
  Section = '';
  PhoneNumber = ''

  
  constructor(private sharedService:SharedService,private router:Router,private location:Location){

  }
  
  goToLogin() {
  this.router.navigate(['/login']);
}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      // Show validation errors
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Pass form data to SharedService
    this.sharedService.Fname = this.Fname;
    this.sharedService.Mname = this.Mname;
    this.sharedService.Lname = this.Lname;
    this.sharedService.StudId = this.StudId;
    this.sharedService.Grade = this.Grade;
    this.sharedService.Section = this.Section;
    this.sharedService.PhoneNumber = this.PhoneNumber;

    
    this.router.navigate(['/register']);  

  }

}
