import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-stsetting',
  standalone: false,
  templateUrl: './stsetting.component.html',
  styleUrl: './stsetting.component.css'
})
export class StsettingComponent implements OnInit {
   isSidebarOpen = false;
    selected = 'weekly'; 
    successMessage = "";
    errorMessage = ""
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
  SchoolYearID?: number;
} = {};
  showLogoutModal = false;
  avatar = ""
      constructor(private router: Router, private sharedService: SharedService){
        this.avatar = this.sharedService.defaultAvatar;
      

        const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;


              switch (userType) {
                case 'Student':
                  this.sharedService.CurrentStudent = parsedUser;
                  this.router.navigate(['/stsetting']);
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

            const evaluating = this.sharedService.getWithExpiry(`Evaluating_${this.Student.StudID}`);
            if(evaluating){
              try{
                   this.router.navigate(['/steval-form']);
                   return
              } catch (e){
                console.error('Error parsing user from storage:', e);
              }
            }
  }

    ngOnInit(): void {
       this.getProfile()
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
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }
     openLogoutModal() {
      this.showLogoutModal = true;
    }

    closeLogoutModal() {
      this.showLogoutModal = false;
    }

    // Router
      goToDashboard(){
            this.router.navigate(['/stdashboard']);
          }
        goToEvalForm() {
            this.router.navigate(['steval-form']);
          }
      goToSettings() {
        this.router.navigate(['/tsettings']);
      }
        logout(){
        this.sharedService.logout().subscribe(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        this.router.navigate(['/login']);
      });
      }

      
 editingEmail = false;
editingPassword = false;
showPassword = false;
newPassword = "************"; // initially hidden

toggleEmailEdit() {
  this.editingEmail = true;
}

cancelEmailEdit() {
  this.editingEmail = false;
  // reload from your Admin data if canceled
}

saveEmail() {
  this.sharedService.updateEmail(this.Student.AccID!, this.Student.Email!).subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.successMessage = 'Email updated successfully!';
        this.editingEmail = false;
      } else {
        this.errorMessage = res.message
      }
    },
    error: () => alert('Server error while updating email.')
  });
}


togglePasswordEdit() {
  this.editingPassword = true;
  this.showPassword = true;
  this.newPassword = '';
}

cancelPasswordEdit() {
  this.editingPassword = false;
  this.showPassword = false;
  this.newPassword = '************';
}

savePassword() {
  if (!this.newPassword.trim()) {
    alert('Password cannot be empty!');
    return;
  }

  this.sharedService.updatePassword(this.Student.AccID!, this.newPassword).subscribe({
  next: (res) =>{
        if(res.status === "success"){
          this.successMessage = "Password Updated Successfully"
          this.showPassword = false;
          this.editingPassword = false;
         this.newPassword = '************';
        }
  },error : (err) =>{

  }
  })
}
}
