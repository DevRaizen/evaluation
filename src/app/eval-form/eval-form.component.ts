import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eval-form',
  standalone: false,
  templateUrl: './eval-form.component.html',
  styleUrl: './eval-form.component.css'
})
export class EvalFormComponent {
    isSidebarOpen = false;
    showCategoryModal = false;
    categories: string [] = ['Respect', 'Punctuality', 'Professionalism', 'Clarity'];
    originalCategories: string[] = [];
    questionTypes = ['Likert Scale', 'Comment', 'Yes/No'];
    newCategory: string = '';
    editMode: boolean[] = new Array(this.categories.length).fill(false);
    questions: {
      category: string;
      list: {
        text: string;
        type: string;
      }[];
    }[] = [];
    showAddForm = false;
    newQuestion = {
      category: '',
      text: '',
      type: 'Likert Scale'
    };
    constructor(private router:Router){
  
    }
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }

    // Router Section
    goToDashboard(){
      this.router.navigate(['/dashboard']);
    }
    goToManageUser() {
      this.router.navigate(['/manage-user']);
    }
    goToSubjectMap() {
      this.router.navigate(['/subject-map']);
    }
    goToEvalForm() {
      this.router.navigate(['/eval-form']);
    }
    goToEvalSched() {
      this.router.navigate(['/eval-sced']);
    }
    goToGenReport() {
      this.router.navigate(['/gen-report']);
    }
    goToSettings() {
      this.router.navigate(['/settings']);
    }

    // Question Section
  addNewQuestion() {
    if (!this.newQuestion.category || !this.newQuestion.text || !this.newQuestion.type) return;

    const group = this.questions.find(g => g.category === this.newQuestion.category);
    if (group) {
      group.list.push({
        text: this.newQuestion.text,
        type: this.newQuestion.type
      });
    } else {
      this.questions.push({
        category: this.newQuestion.category,
        list: [{ text: this.newQuestion.text, type: this.newQuestion.type }]
      });
    }

    // Reset and hide form
    this.newQuestion = { category: '', text: '', type: 'Likert Scale' };
    this.showAddForm = false;
  }

  cancelAdd() {
    this.newQuestion = { category: '', text: '', type: 'Likert Scale' };
    this.showAddForm = false;
  }


  openCategoryModal() {
    this.showCategoryModal = true;
    this.originalCategories = [...this.categories]; 
    this.editMode = new Array(this.categories.length).fill(false);
  }

  trackByIndex(index: number): number {
    return index;
  }

  addCategory() {
    if (this.newCategory.trim()) {
      this.categories.push(this.newCategory.trim());
      this.editMode.push(false);
      this.newCategory = '';
    }
  }

  editCategory(index: number, inputRef: HTMLInputElement) {
    this.editMode[index] = true;
    setTimeout(() => {
      inputRef.focus();
      inputRef.select();
    });
  }

  deleteCategory(index: number) {
    this.categories.splice(index, 1);
    this.editMode.splice(index,1);
  }

  saveCategories() {
    console.log('Saving categories:', this.categories);
    this.showCategoryModal = false;

  }
  onCategoryChange(index: number, newValue: string) {
    this.categories[index] = newValue;
  }

  cancelAddCat() {
    this.categories = [...this.originalCategories];
    this.showCategoryModal = false;
    this.editMode = new Array(this.categories.length).fill(false);
  }

}
