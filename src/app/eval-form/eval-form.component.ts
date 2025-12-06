import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-eval-form',
  standalone: false,
  templateUrl: './eval-form.component.html',
  styleUrl: './eval-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvalFormComponent implements OnInit {
  isAddingNew = false;
  showLogoutModal = false;
  showDeleteModal = false;
  itemToDeleteId: number | null = null;
  avatar?: any;
  errorMessage ="";
    isSidebarOpen = false;
    showCategoryModal = false;
    categories: { catID: number; categoryName: string }[] = [];
    originalCategories: { catID: number; categoryName: string }[] = [];
   questionnaires: { QID: number; QTitle: string }[] = [];
    questionTypes = ['Likert Scale', 'Comment'];
    newCategory: string = '';
     // To track if user is adding a new questionnaire
    newQID: number | null = null;
    editMode: boolean[] = new Array(this.categories.length).fill(false);
    questions: {
      category: string;
      list: {
        QuesID?: number;
        text: string;
        type: string;
      }[];
    }[] = [];
    showAddForm = false;
    newQuestion = {
      category: null,
      text: '',
      type: 'Likert Scale' // changeable to Likert
    };
    selectedQID: number | null = null;
    selectedCategory = "";

    constructor(private router:Router, private sharedService: SharedService,private cd: ChangeDetectorRef){
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
                  this.isAddingNew = this.sharedService.addquesmod;
                  break;
                case 'Teacher':
                  this.sharedService.CurrentTeacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                case 'Principal':
                  this.sharedService.Principal = parsedUser;
                  this.router.navigate(['/pdashboard']);
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
      console.log(this.sharedService.CurrentAdmin)
      setTimeout(() => this.sharedService.addquesmod = false,200);
      this.getAllCategories();
      this.getAllQuestionnaireIDs();
      this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
              
            }
          });
     setTimeout(() => this.skipAnimation = false);
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
      this.selectedCategory = this.categories[0].categoryName;
      console.log(res.cat.CategoryName);
      this.cd.markForCheck();
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
      console.log('All Questionnaires:', res); 
      this.questionnaires = res.map((q: any) => ({
        QID: q.QID,
        QTitle: q.QTitle // make sure your backend returns QTitle
      }));
      this.cd.markForCheck();
    },
    error: (err) => {
      console.error('Failed to fetch Questionnaires:', err);
    }
  });
}


fetchQuestionsByQID(qid: number, filterCategory?: string) {
  this.sharedService.getQuestionsByQID(qid).subscribe({
    next: (res) => {
      const grouped: {
        category: string;
        list: { QuesID: number; text: string; type: string }[];
      }[] = [];

      res.questions.forEach((q: any) => { 
        if (filterCategory && q.categoryName !== filterCategory) return; // 🔥 filtering

        let group = grouped.find(g => g.category === q.categoryName);
        console.log(group,"asd")
        if (!group) {
          group = { category: q.categoryName, list: [] };
          grouped.push(group);
          console.log(grouped)
        }
        console.log(group,'create')
        group.list.push({
          QuesID: q.QuesID,
          text: q.questionText,
          type: q.type
        });
      });

      this.questions = grouped;
      console.log(this.questions)
      this.cd.markForCheck();
    }
  });
}






onQIDChange() {
  if (this.selectedQID !== null) {
    this.fetchQuestionsByQID(this.selectedQID,this.selectedCategory);
  }
}

onCatChange() {
  if (this.selectedQID !== null) {
    this.fetchQuestionsByQID(this.selectedQID,this.selectedCategory);

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
      this.fetchQuestionsByQID(this.selectedQID!,this.selectedCategory)
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


  deleteQuestion(q: any) {
  if (confirm(`Are you sure you want to delete this question: "${q.text}"?`)) {
    this.sharedService.deleteQuestion(q.QuesID).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          
          console.log('✅ Deleted:', res.message);
          
          
          this.errorMessage = "Question Deleted successfully.";
          // Optionally reload your list
          this.onCatChange(); // or reloadQuestions()
          this.cd.markForCheck();
        } else {
          console.error('⚠️ Delete failed:', res.message);
        }
      },
      error: (err) => {
        console.error('❌ Error deleting question:', err);
      }
    });
  }
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
        this.showCategoryModal = false;
        this.cd.markForCheck();
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
          this.showCategoryModal = false;
          this.cd.markForCheck();
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
    next: (res) => {
      if(res.status === "success"){
        console.log(res.status, "ccheckl")
         this.editMode[index] = false;
         this.showCategoryModal = false;
        this.errorMessage = "Category updated successfully.";
        this.originalCategories[index] = { ...cat }; // update cache
        this.cd.markForCheck();
      }else{
        this.errorMessage = res.message;
      }
     
    },
    error: (err) => {
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
  this.showCategoryModal = false;
}

closeDeleteModal() {
  this.showDeleteModal = false;
  this.itemToDeleteId = null;
}

confirmDelete() {
  const index = this.itemToDeleteId!;
  const catID = this.categories[index].catID;
  const deletedCategory = this.categories[index].categoryName;

  if (catID > 0) {
    this.sharedService.deleteCategoryFromDB(catID).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          // ✅ Remove from UI
          this.categories.splice(index, 1);
          this.editMode.splice(index, 1);

          this.closeDeleteModal();
          this.errorMessage = "Category Deleted Successfully";

          // ✅ Reset selectedCategory if it was deleted
          if (this.selectedCategory === deletedCategory) {
            if (this.categories.length > 0) {
              this.selectedCategory = this.categories[0].categoryName;

              // 🔥 Explicitly reload questions with selected QID + category
              if (this.selectedQID !== null) {
                this.fetchQuestionsByQID(this.selectedQID, this.selectedCategory);
              }
            } else {
              this.selectedCategory = '';
              this.questions = [];
            }
          }
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




    editingQuestionId: number | null = null;
originalQuestionText: string = '';

editQuestion(q: any) {
  this.editingQuestionId = q.QuesID; // Assuming each question has an ID
  this.originalQuestionText = q.text; // Save original text
}

cancelEdit() {
  // Restore the original text
  const question = this.questions
    .flatMap(g => g.list)
    .find(q => q.QuesID === this.editingQuestionId);
  if (question) question.text = this.originalQuestionText;
  this.editingQuestionId = null;
}

saveEdit(q: any) {
    this.sharedService.updateQuestionText(q.QuesID, q.text).subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.successMessage = 'Question updated successfully!'
        this.editingQuestionId = null;
      } else {
        
        alert('Failed to update question: ' + res.message);
      }
    },
    error: (err) => {
      console.error(err);
      alert('An error occurred while updating the question.');
    }
  });
}

    
    successMessage =""
    pendingList: any[] = [];
    isNotifOpen: boolean = false;
    skipAnimation = true;
    toggleNotif() {
      this.isNotifOpen = !this.isNotifOpen;
    }

    closeNotif() {
      this.isNotifOpen = false;
    }

  approveStudent(studID: string) {
    this.sharedService.approveStudent(studID).subscribe((res: any) => {
      if (res.status === 'success') {
        this.successMessage = '✅ Student approved successfully';
        this.pendingList = this.pendingList.filter(s => s.StudID !== studID);
        this.isNotifOpen = false;
      } else {
        alert('❌ ' + res.message);
      }
    });
  }

    rejectStudent(studID: string) {
        this.sharedService.rejectStudent(studID).subscribe((res: any) => {
          if (res.status === 'success') {
             this.successMessage = 'Student rejected and deleted';
            this.pendingList = this.pendingList.filter(s => s.StudID !== studID);
            this.isNotifOpen = false;
          } else {
            alert('❌ ' + res.message);
          }
        });
      }

    // Router Section
    goToDashboard(){
      this.router.navigate(['/dashboard']);
    }
    goToManageUser() {
      this.router.navigate(['/manage-user']);
    }
    goToSubjectMap(){
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
    }// ------------------ NEW QUESTIONNAIRE VARIABLES ------------------      // modal open/close
newQuestionnaireTitle: string = '';     // title of questionnaire
newQuestions: any[] = [];               // temp questions
newQuestionTemp = { category: '', text: '', type: 'Likert Scale' };
showAddFormTemp: boolean = false;

// ------------------ NEW QUESTIONNAIRE METHODS ------------------
addQuestionToNewQuestionnaire() {
  if (!this.newQuestionTemp.text || !this.newQuestionTemp.category) return;

  this.newQuestions.push({
    category: this.newQuestionTemp.category,
    text: this.newQuestionTemp.text,
    type: this.newQuestionTemp.type
  });

  this.newQuestionTemp = { category: '', text: '', type: 'Likert Scale' };
  this.showAddFormTemp = false;
   if (this.categories.length > 0) {
    this.newQuestionTemp.category = this.categories[0].categoryName;
  }
}

removeQuestionFromNewQuestionnaire(q: any) {
  const idx = this.newQuestions.indexOf(q);
  if (idx > -1) this.newQuestions.splice(idx, 1);
}

qError = ""
nError = ''
saveNewQuestionnaire() {
  this.qError = ''; 
  this.nError = ''

  if (!this.newQuestionnaireTitle.trim()) {
    this.qError  = 'Please enter a Questionnaire Title.';
     setTimeout(() => this.qError = "",2000);
    return;
  }

 
  if (this.newQuestions.length === 0) {
    this.nError = 'Please add at least one question before saving.';
     setTimeout(() => this.nError = "",2000);
    return;
  }

  // 🧩 Proceed with saving
  this.sharedService.saveNewQuestionnaire(this.newQuestionnaireTitle, this.newQuestions)
    .subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.successMessage ='Questionnaire saved successfully!';
          console.log('New QID:', res.QID);
          this.isAddingNew = false;
          this.newQuestions = [];
          this.newQuestionnaireTitle = '';
          this.ngOnInit();
        } else {
          this.errorMessage = res.message || 'Error saving questionnaire.';
        }
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.errorMessage = 'Something went wrong while saving the questionnaire.';
      }
    });
}

cancelAddQuestionnaire() {
  this.isAddingNew = false;
  this.newQuestionnaireTitle = '';
  this.newQuestions = [];
  this.newQuestionTemp = { category: '', text: '', type: 'Likert Scale' };
  this.showAddFormTemp = false;
}

addquestionaire() {
  this.isAddingNew = true; // just open modal
   if (this.categories.length > 0) {
    this.newQuestionTemp.category = this.categories[0].categoryName;
  }
}

// ------------------ UTILITY ------------------
getGroupedQuestions(questions: any[]) {
  const grouped: { category: string; list: any[] }[] = [];
  questions.forEach(q => {
    let group = grouped.find(g => g.category === q.category);
    if (!group) {
      group = { category: q.category, list: [] };
      grouped.push(group);
    }
    group.list.push(q);
  });
  return grouped;
}


showExistingModal = false;
existingQuestions: any[] = [];

openExistingQuestionModal() {
  this.showExistingModal = true;

  // Fetch existing questions (from API or already loaded data)
  this.sharedService.getExistingQuestions().subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.existingQuestions = res.questions.map((q: any) => ({
          ...q,
          selected: false
        }));
        this.cd.markForCheck();
      }
    },
    error: (err) => console.error(err)
  });
}

closeExistingModal() {
  this.showExistingModal = false;
}

addSelectedQuestions() {
  const selected = this.existingQuestions.filter(q => q.selected);
  if (selected.length === 0) return;

  // Add to current new questionnaire
  this.newQuestions.push(...selected.map(q => ({
    category: q.category,
    text: q.text,
    type: q.type
  })));

  this.closeExistingModal();
}


trackByCategory(index: number, item: any) {
  return item.category;
}
trackByindex(index: number, item: any) {
  return index;
}

}


