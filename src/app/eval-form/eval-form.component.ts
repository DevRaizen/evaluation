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
  showLogoutModal = false;
  showDeleteModal = false;
  itemToDeleteId: number | null = null;
  avatar?: any;
  errorMessage ="";
    isSidebarOpen = false;
    showCategoryModal = false;
    categories: { catID: number; categoryName: string }[] = [];
    originalCategories: { catID: number; categoryName: string }[] = [];
    questionnaireIDs: number[] = [];
    questionTypes = ['likert', 'comment'];
    newCategory: string = '';
    isAddingNew = false; // To track if user is adding a new questionnaire
    newQID: number | null = null;
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
    selectedQID: number | null = null;
    

    constructor(private router:Router, private sharedService: SharedService){
      this.avatar = this.sharedService.defaultAvatar;

        const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;

              switch (userType) {
                case 'Student':
                  this.sharedService.CurrentStudent = parsedUser;
                  this.router.navigate(['/stdashboard']);
                  break;
                case 'Admin':
                  this.sharedService.CurrentAdmin = parsedUser;
                  this.router.navigate(['/eval-form']);
                  break;
                case 'Teacher':
                  this.sharedService.CurrentTeacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                default:
            
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
      this.getAllCategories();
      this.getAllQuestionnaireIDs();
     
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

getAllQuestionnaireIDs() {
  this.sharedService.getAllQuestionnaireIDs().subscribe({
    next: (res) => {
      console.log('All QIDs:', res); 
      this.questionnaireIDs = res;
    },
    error: (err) => {
      console.error('Failed to fetch QIDs:', err);
    }
  });
}

fetchQuestionsByQID(qid: number) {
  this.sharedService.getQuestionsByQID(qid).subscribe({
    next: (res) => {
      // Transform response into grouped by category format
      const grouped: {
        category: string;
        list: { text: string; type: string }[];
      }[] = [];

      res.questions.forEach((q: any) => {
        let group = grouped.find(g => g.category === q.categoryName);
        if (!group) {
          group = { category: q.categoryName, list: [] };
          grouped.push(group);
        }
        group.list.push({
          text: q.questionText,
          type: q.type
        });
      });

      this.questions = grouped;
      console.log(this.questionTypes)
      
    },
    error: (err) => {
      console.error('Failed to fetch questions:', err);
      this.errorMessage = 'Could not load questions.';
    }
  });
}


prepareNewQuestionnaire() {
  // Get highest existing QID (whether from DB or UI-added)
  const maxQID = this.questionnaireIDs.length > 0 ? Math.max(...this.questionnaireIDs) : 0;

  this.newQID = maxQID + 1;
  this.selectedQID = this.newQID;
  this.isAddingNew = true;

  // Push it to local list (UI only, no backend yet)
  this.questionnaireIDs.push(this.newQID);

  // Clear questions so user can enter new ones
  this.questions = [];

  console.log('Prepared Questionnaire #', this.newQID);
}

cancelNewQuestionnaire() {
  if (this.isAddingNew && this.newQID) {
    // Remove the temporary QID from the UI list
    this.questionnaireIDs = this.questionnaireIDs.filter(id => id !== this.newQID);

    // Clear temp state
    this.questions = [];
    this.selectedQID = null;
    this.newQID = 0;
    this.isAddingNew = false;

    console.log('Cancelled new questionnaire creation.');
  }
}

saveQuestionnaire() {
    const hasQuestions = this.questions.some(group => group.list.length > 0);

  if (!hasQuestions) {
    this.errorMessage = "You must add at least one question before saving.";
    return;
  }

  this.sharedService.saveQuestionnaire(this.newQID!, this.questions).subscribe({
    next: (res) => {
      console.log('Saved:', res);
      this.isAddingNew = false;
      this.newQID = 0;
      this.selectedQID = null;
      this.errorMessage = "Questionnaire Saved Successfully";
    },
    error: (err) => {
      console.error('Error:', err);
    }
  });
}


onQIDChange() {
  if (this.selectedQID !== null) {
    this.fetchQuestionsByQID(this.selectedQID);
  }
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
 const safeQuestion = {
    text: this.newQuestion.text,
    type: this.newQuestion.type,
    category: this.newQuestion.category as string
  };


      this.sharedService.addSingleQuestionToQuestionnaire(this.selectedQID!,safeQuestion).subscribe({
    next: (res) => {
      console.log("Saved to DB:", res);
      this.errorMessage = "Question saved successfully.";
    },
    error: (err) => {
      console.error("Failed to save question:", err);
      this.errorMessage = "Error saving question.";
    }
  });
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
  if (!trimmedName) return;

  this.sharedService.addCategory(trimmedName).subscribe({
    next: (res) => {
      if (res.status === 'success') {
        const newCat = {
          catID: res.catID,
          categoryName: trimmedName
        };
        this.categories.push(newCat);
        this.editMode.push(false);
        this.newCategory = '';
        this.errorMessage = "Category Added Successfully";
        
      } else if (res.status === 'exists') {
        this.errorMessage = "Category already exists.";
      } else {
        this.errorMessage = "Failed to add category.";
      }
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = "Error connecting to server.";
    }
  });
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
  const catID = this.categories[index].catID;

  if (catID > 0) {
    this.sharedService.deleteCategoryFromDB(catID).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.categories.splice(index, 1);
          this.editMode.splice(index, 1);
          this.errorMessage = "Category Deleted Successfully";
        } else {
          alert(res.message || "Error deleting category.");
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert("Failed to delete category.");
      }
    });
  } else {
    // For new categories not saved in DB yet
    this.categories.splice(index, 1);
    this.editMode.splice(index, 1);
  }
}

saveSingleCategory(index: number) {
  const cat = this.categories[index];

  if (!cat.catID || !cat.categoryName.trim()) return;

  this.sharedService.updateCategory(cat.catID, cat.categoryName.trim()).subscribe({
    next: () => {
      this.editMode[index] = false;
      this.errorMessage = "Category updated successfully.";
      this.originalCategories[index] = { ...cat }; // update cache
    },
    error: () => {
      this.errorMessage = "Error updating category.";
    }
  });
}


saveCategories() {
  console.log('Saving categories:', this.categories);
  // You can implement API call here to save/update to DB
  this.originalCategories = [...this.categories];
  this.showCategoryModal = false;
}

 cancelAddCat() {
  
  this.editMode = new Array(this.categories.length).fill(false);
  this.showCategoryModal = false;
}

cancelEditCategory(index: number) {
  // Revert to original name if changed
  this.categories[index].categoryName = this.originalCategories[index].categoryName;
  this.editMode[index] = false;
}


openDeleteModal(id: number) {
  this.itemToDeleteId = id;
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.showDeleteModal = false;
  this.itemToDeleteId = null;
}

confirmDelete() {
  const index = this.itemToDeleteId!;
  const catID = this.categories[index].catID;

  if (catID > 0) {
    this.sharedService.deleteCategoryFromDB(catID).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.categories.splice(index, 1);
          this.editMode.splice(index, 1);
          this.closeDeleteModal()
          this.errorMessage ="Category Deleted Successfully";
          this.ngOnInit();
        } else {
          alert(res.message || "Error deleting category.");
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert("Failed to delete category.");
      }
    });
  } else {
    // For new categories not saved in DB yet
    this.categories.splice(index, 1);
    this.editMode.splice(index, 1);
  }
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


