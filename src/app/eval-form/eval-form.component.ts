import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-eval-form',
  standalone: false,
  templateUrl: './eval-form.component.html',
  styleUrl: './eval-form.component.css'
})
export class EvalFormComponent implements OnInit {
  errorMessage ="";
    isSidebarOpen = false;
    showCategoryModal = false;
    categories: { catID: number; categoryName: string }[] = [];
    originalCategories: { catID: number; categoryName: string }[] = [];
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
      category: null,
      text: '',
      type: 'Likert Scale'
    };
    constructor(private router:Router, private sharedService: SharedService){
  
    }
    ngOnInit(): void {
      this.getAllCategories();
    }

getAllCategories() {
  this.sharedService.getAllCategories().subscribe({
    next: (res) => {
      this.categories = res.map((cat: any) => ({
        catID: cat.catID,
        categoryName: cat.categoryName
      }));
      this.originalCategories = [...this.categories];
      this.editMode = new Array(this.categories.length).fill(false);
      console.log(res.cat.CategoryName);
    },
    error: (err) => {
      console.error('Failed to fetch categories:', err);
      this.errorMessage = 'Could not load categories.';
    }
  });
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
    this.newQuestion = { category: null, text: '', type: 'Likert Scale' };
    this.showAddForm = false;
  }

  cancelAdd() {
    this.newQuestion = { category: null, text: '', type: 'Likert Scale' };
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
  const trimmedName = this.newCategory.trim();
  if (trimmedName) {
    const newCat = {
      catID: 0, // 0 or any temporary value since not from DB
      categoryName: trimmedName
    };
    this.categories.push(newCat);
    this.editMode.push(false);
    this.newCategory = '';
  }
}

onCategoryChange(index: number, newValue: string) {
  this.categories[index].categoryName = newValue.trim();
}

editCategory(index: number, inputRef: HTMLInputElement) {
  this.editMode[index] = true;
  setTimeout(() => {
    inputRef.focus();
    inputRef.select();
  }, 0);
}

deleteCategory(index: number) {
  this.categories.splice(index, 1);
  this.editMode.splice(index, 1);
}


saveCategories() {
  console.log('Saving categories:', this.categories);
  // You can implement API call here to save/update to DB
  this.originalCategories = [...this.categories];
  this.showCategoryModal = false;
}

 cancelAddCat() {
  this.categories = [...this.originalCategories];
  this.editMode = new Array(this.categories.length).fill(false);
  this.showCategoryModal = false;
}


}
