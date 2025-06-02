import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';


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
  Schoolid = '';
  Grade = '';
  Section = '';
  PhoneNumber = ''

  constructor(private sharedService:SharedService,private router:Router){

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
    this.sharedService.Schoolid = this.Schoolid;
    this.sharedService.Grade = this.Grade;
    this.sharedService.Section = this.Section;
    this.sharedService.PhoneNumber = this.PhoneNumber;

    
    this.router.navigate(['/register']);  

  }

  
  
  
  /*
  users: any[] = [];
  newName: string = '';
  psw: string = ';'
  errorMessage: string = '';
  user: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {
    this.user = localStorage.getItem("user");
    if(this.user){
     this.router.navigate(['/dashboard']);
    }else{
     this.router.navigate(['/user']);
    }
  }

  
  goToLogin() {
    this.router.navigate(['/login']); // Navigate to Login
  }
  

  addUser(pname: string, pass: string) {
    this.newName = pname.trim();
    this.psw = pass.trim();
  
    // Client-side validation for empty fields
    if (!this.newName || !this.psw) {
      this.errorMessage = 'Name and password are required';  
      return; // Stop execution if validation fails
    }
  
    this.apiService.addUser(this.newName, this.psw).subscribe(
      (response) => {
        this.newName = '';  
        this.psw = '';  
        alert("success");
        this.errorMessage = '';  // Clear any previous error message
      },
      (error) => {
        console.error('Error adding user:', error); // Debugging
        this.errorMessage = error?.error?.message || 'Failed to add user';  // Ensure correct error message is shown
      }
    );
  }
  */

}
