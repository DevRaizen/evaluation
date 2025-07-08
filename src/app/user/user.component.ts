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
  errorMessage?: string;
  Fname = '';
  Mname = '';
  Lname = '';
  StudId = '';
  Grade = '';
  Section = '';
  PhoneNumber = ''
  
  allSections: { [key: string]: string[] } = {
  '7': ['St. Peter', 'St. Paul'],
  '8': ['St. John', 'St. Agnes'],
  '9': ['St. Therese', 'St. Monica'],
  '10': ['St. Joseph', 'St. Veronica']
};
  
  constructor(private sharedService:SharedService,private router:Router,private location:Location){

  }


getSectionsForGrade(): string[] {
  return this.allSections[this.Grade] || [];
}
onGradeChange() {
  const availableSections = this.getSectionsForGrade();
  if (!availableSections.includes(this.Section)) {
    this.Section = ""; 
  }
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

    
this.sharedService.checkStudIdExists(this.StudId).subscribe(response => {
  if (response.exists) {
    this.errorMessage = "Student ID already exists!";
  }else{
      
    this.sharedService.Student.Fname = this.Fname;
    this.sharedService.Student.Mname = this.Mname;
    this.sharedService.Student.Lname = this.Lname;
    this.sharedService.Student.StudId = this.StudId;
    this.sharedService.Student.Grade = this.Grade;
    this.sharedService.Student.Section = this.Section;
    this.sharedService.Student.PhoneNumber = this.PhoneNumber;

    this.router.navigate(['/register']);  
  }
});
 

  }

}
