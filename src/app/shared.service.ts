import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public Fname?: string;
  public Mname?: string;
  public Lname?: string;  
  public StudId?: string;
  public Grade?: string;
  public Section?: string;
  public PhoneNumber?: string;
  public Email?: string;
  public Password?: string;
  constructor(private http: HttpClient) { }

  sendVerificationEmail(email:string, code: string){
    const url = 'http://localhost/teacher-evaluation-backend/verification.php'; 
    return this.http.post(url, { email, code });
  }

  sendUserInfoToDB() {
  const url = 'http://localhost/teacher-evaluation-backend/api.php'; // <- create this PHP file
  const userData = {
    action: 'register',
    fname: this.Fname,
    mname: this.Mname,
    lname: this.Lname,
    studid: this.StudId,
    grade: this.Grade,
    section: this.Section,
    phone_number: this.PhoneNumber,
    email: this.Email,
    password: this.Password
  };
  return this.http.post(url, userData);
}
}

