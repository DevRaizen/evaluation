import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-steval-form',
  standalone: false,
  templateUrl: './steval-form.component.html',
  styleUrl: './steval-form.component.css'
})
export class StevalFormComponent implements OnInit {
    showLogoutModal = false;
    errorMessage = '';
    avatar = ';'
    selectedTeacher: any = {};
    EvalSetting: any = {};
    imagePreview: string | ArrayBuffer | null = null;
    isSidebarOpen = false;
    currentQuestion = 0;
    Student: {
      Fname?: string;
      Mname?: string;
      Lname?: string;
      StudID?: string;
      Grade?: string;
      AccID?: number;
      Section?: string;
      PhoneNumber?: string;
      Email?: string;
      Password?: string;
      UserType?: string;
    } = {};
    questions: any [] = [];
  /*  questions = [
      { type: 'likert', text: 'The teacher treats all students fairly and equally.' },
      { type: 'likert', text: 'The teacher respects students’ opinions and listens attentively.' },
      { type: 'likert', text: 'The teacher explains lessons clearly and understandably.' },
      { type: 'likert', text: 'The teacher is well-prepared for class activities and discussions.' },
      { type: 'likert', text: 'The teacher uses class time effectively and efficiently.' },
      { type: 'likert', text: 'The teacher encourages students to participate and ask questions.' },
      { type: 'likert', text: 'The teacher provides helpful feedback on student work.' },
      { type: 'comment', text: 'What do you like most about this teacher’s teaching style?' },
      { type: 'comment', text: 'What suggestions do you have for improving the teacher’s methods?' },
      { type: 'comment', text: 'Any other comments or feedback you’d like to share?' }
    ]; */
    questionsPerPage = 5;
    currentPage = 1;

    answers: (number | string)[] = new Array(this.questions.length).fill(null);

      constructor(private router: Router, private sharedService: SharedService){
      
      this.avatar = this.sharedService.defaultAvatar;
      this.imagePreview = this.sharedService.defaultAvatar;

      // getting selected Teacher on Evaluation
      const evaluating = this.sharedService.getWithExpiry("Evaluating");
      const evalset = this.sharedService.getWithExpiry("EvalSet");

      if (evaluating && evalset) {
        this.selectedTeacher = evaluating;
        this.EvalSetting = evalset;

        if (this.selectedTeacher.image === '/user.png') {
          this.imagePreview = this.selectedTeacher.image;
        } else {
          this.imagePreview = `${this.sharedService.burl}${this.selectedTeacher.image}`;
        }

        console.log(this.selectedTeacher);
        console.log(this.EvalSetting);

      } else {
        this.router.navigate(['stdashboard']);
        return;
      }


      // getting the current user
      const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;


              switch (userType) {
                case 'Student':
                  this.sharedService.CurrentStudent = parsedUser;
                  this.router.navigate(['/steval-form']);
                  this.Student = this.sharedService.CurrentStudent;
                  console.log(this.Student);
                  
                  break;
                case 'Admin':
                  this.sharedService.Admin = parsedUser;
                  this.router.navigate(['/dashboard']);
                  break;
                case 'Teacher':
                  this.sharedService.Teacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                default:
                  // Unknown role, redirect to login
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
    ngOnInit(): void {
      this.getProfile()
      this.getQuestionaire();
    }

    getProfile(){
     const payload = {
      userid: this.Student.StudID,
      userRole: this.Student.UserType
     }
     console.log(payload);
    this.sharedService.getProfile(payload).subscribe({
      next: (res) =>{
        console.log("response",res);
        if(res && res.status === 'success' && res.image){
          if (res.image === '/user.png') {
            this.avatar = res.image;
          
        } else {
          this.avatar = `${this.sharedService.burl}${res.image}`;
        }
        }else{
          this.avatar = this.sharedService.defaultAvatar;      
        }
      },
      error: (err)=>{
       this.errorMessage ="di mo nakuhaprofile boi";
       console.log(err);
      }
    });
  }

  getQuestionaire(){
    this.sharedService.getQuestionsByQID(this.EvalSetting.QID).subscribe({
      next: (res) => {
        this.questions = res.questions;
        console.log(this.questions)
      },
      error: (err) =>{

      }
    })
  }

 
    get paginatedQuestions() {
      const start = (this.currentPage - 1) * this.questionsPerPage;
      return this.questions.slice(start, start + this.questionsPerPage);
    }
    get totalPages(): number {
      return Math.ceil(this.questions.length / this.questionsPerPage);
    }

    submitAnswers() {
      alert( this.answers);
    }

    onAnswer(): void {
      this.currentQuestion = this.answers.filter(answer => 
        answer !== null && answer !== ''
      ).length;
    } 

      nextPage() {
      this.currentPage++;
    }
    prevPage() {
      this.currentPage--;
    }

    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }   
    goToDashboard(){
        this.router.navigate(['/stdashboard']);
      }
    goToEvalForm() {
        this.router.navigate(['/steval-form']);
      }
    goToSettings() {
        this.router.navigate(['/stsettings']);
      }
       logout(){
        this.sharedService.logout().subscribe(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        this.router.navigate(['/login']);
      });

      }
    openLogoutModal() {
      this.showLogoutModal = true;
    }
    closeLogoutModal() {
      this.showLogoutModal = false;
    }
     
}
