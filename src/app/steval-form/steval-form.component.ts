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

    currentCategoryIndex = 0;  // start with first category


nextCategory() {
  const totalQuestions = this.questions[this.currentCategoryIndex].list.length;
  const answered = this.getAnsweredCountForCategory(this.currentCategoryIndex);

  if (answered < totalQuestions) {
    alert("Sagutan mo lahat bago mag next!");
  } else {
    if (this.currentCategoryIndex < this.questions.length - 1) {
      this.currentCategoryIndex++;
    }
  }
}


prevCategory() {
  if (this.currentCategoryIndex > 0) {
    this.currentCategoryIndex--;
  }
  this.currentQuestion = this.getAnsweredCountForCategory(this.currentCategoryIndex)
}

answers: {
  [catID: number]: { [questionId: number]: number | string }
} = {};

Optionalanswers: {
  [catID: number]: { [questionId: number]: number | string }
} = {};


      constructor(private router: Router, private sharedService: SharedService){
      
      this.avatar = this.sharedService.defaultAvatar;
      this.imagePreview = this.sharedService.defaultAvatar;


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
                case 'Principal':
                  this.sharedService.Principal = parsedUser;
                  this.router.navigate(['/pdashboard']);
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

           // getting selected Teacher on Evaluation
        const evaluating = this.sharedService.getWithExpiry(`Evaluating_${this.Student.StudID}`);
        const evalset = this.sharedService.getWithExpiry(`EvalSet_${this.Student.StudID}`);


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
    this.sharedService.getStudentQuestionsByQID(this.EvalSetting.QID).subscribe({
      next: (res) => {
        this.questions = res.questions; 
        console.log(this.questions)

       const grouped: { catID: number, category: string, list: any[] }[] = [];

        res.questions.forEach((q: any) => {
          let group = grouped.find(g => g.catID === q.catID);
          if (!group) {
            group = { catID: q.catID, category: q.categoryName, list: [] };
            grouped.push(group);

            // 🔑 Initialize answers storage for this category
            this.answers[q.catID] = {};
            this.Optionalanswers[q.catID] = {};
          }
          group.list.push(q);
        });

        this.questions = grouped;

        console.log(this.questions)
      },
      error: (err) =>{

      }
    })
  }

getAnsweredCountForCategory(categoryIndex: number): number {
  // safety check
  if (!this.questions[categoryIndex]) return 0;

  const catID = this.questions[categoryIndex].catID;
  const categoryQuestions = this.questions[categoryIndex].list;

  let answered = 0;

  for (const q of categoryQuestions) {
    const value = this.answers[catID]?.[q.QuesID]; // ✅ nested lookup
    if (value !== null && value !== '' && value !== undefined) {
      answered++;
    }
  }

  return answered;
}

 
    submitAnswers() {
       const totalQuestions = this.questions[this.currentCategoryIndex].list.length;
    const answered = this.getAnsweredCountForCategory(this.currentCategoryIndex)
      if(answered < totalQuestions){
   alert( "You need to complete all the answer"); 
      }else{
        
             const payload = {
    StudID: this.Student.StudID!,
    TeacherID: this.selectedTeacher.TeacherID,
    SubjectID: this.selectedTeacher.SubjectID,
    ESetID: this.EvalSetting.ESetID,
    SchoolYearID: this.EvalSetting.SchoolYearID,
    answers: this.answers,
    Optionalanswers: this.Optionalanswers
  };

  this.sharedService.submitEvaluation(payload).subscribe({
    next: (res) => {
      if (res.status === 'success') {
       // alert('Evaluation submitted successfully!');
        sessionStorage.removeItem(`Evaluating_${this.Student.StudID}`);
        sessionStorage.removeItem(`EvalSet_${this.Student.StudID}`);
        this.router.navigate(['/stdashboard']);
      } else {
        alert("May error");
      }
    },
    error: (err) => {
      console.error('Submission failed:', err);
     // alert('Data base Error: ' + err);
    }
  });
   
      }
   
    }

    onAnswer(): void {
     this.currentQuestion = Object.values(this.answers).filter(answer =>
    answer !== null && answer !== ''
  ).length
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
