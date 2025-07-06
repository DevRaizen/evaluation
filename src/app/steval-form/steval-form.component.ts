import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-steval-form',
  standalone: false,
  templateUrl: './steval-form.component.html',
  styleUrl: './steval-form.component.css'
})
export class StevalFormComponent {
    constructor(private router: Router){}

    imagePreview: string | ArrayBuffer | null = null;
    isSidebarOpen = false;
    currentQuestion = 0;
    questions = [
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
    ];
    questionsPerPage = 5;
    currentPage = 1;

    answers: (number | string)[] = new Array(this.questions.length).fill(null);

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

    nextPage() {
      this.currentPage++;
    }
    prevPage() {
      this.currentPage--;
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
}
