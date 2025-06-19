import { Component } from '@angular/core';

@Component({
  selector: 'app-manage-user',
  standalone: false,
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent {
    isSidebarOpen = false;
    showPassword = false;
    showconPassword = false;
    Password?: string;
    conPassword?: string;
    AisModalOpen = false;
    EisModalOpen = false;
    public barChartPlugins = [];

    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }

    AopenModal() {
      this.AisModalOpen = true;
    }

    AcloseModal() {
      this.AisModalOpen = false;
  }
   EopenModal() {
      this.EisModalOpen = true;
    }

    EcloseModal() {
      this.EisModalOpen = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
  }
  toggleconPasswordVisibility(): void {
    this.showconPassword = !this.showconPassword;
    
  }

}
