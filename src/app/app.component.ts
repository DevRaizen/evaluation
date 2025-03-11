import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'teacher-evaluation-system';
  menuOpen: boolean = false;

  toggleMenu()  
  {
   if(this.menuOpen == true){
    this.menuOpen = false;
   }else{
    this.menuOpen = true;
   }
  }
}
