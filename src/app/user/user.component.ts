import { Component, OnInit } from '@angular/core';
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
export class UserComponent implements OnInit{
  errorMessage?: string;
  Fname = '';
  Mname = '';
  Lname = '';
  StudId = '';
  Grade: string[] = []
  selectedGrade = '';
  Section = '';
  
  
  allSections: { [key: string]: string[] } = {};
  
  constructor(private sharedService:SharedService,private router:Router,private location:Location){

  }

   ngOnInit(){
    this.getYearSection()
   }


  getYearSection(){
    this.sharedService.getYearSec().subscribe({
      next: (res) =>{
        if(res.status === "success"){
          const data = res.yearsec;

          data.forEach((item:any)=>{
            const grade = item.YearLevel;
            const section = item.SectionName

            if(!this.allSections[grade]){
              this.allSections[grade] = [];
            }
            this.allSections[grade].push(section);
            console.log(this.allSections);
          })

          this.Grade = Object.keys(this.allSections).map(key => String(key));
        }
      },
      error: (err) => {

      }
    });
  }

getSectionsForGrade(): string[] {
  return this.allSections[this.selectedGrade] || [];
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
    this.sharedService.Student.Grade = this.selectedGrade;
    this.sharedService.Student.Section = this.Section;

    this.router.navigate(['/register']);  
  }
});
 

  }

}
