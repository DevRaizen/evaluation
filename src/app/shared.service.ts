import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  defaultAvatar = "/user.png";

 Student: {
  Fname?: string;
  Mname?: string;
  Lname?: string;
  StudId?: string;
  Grade?: string;
  AccID?: number;
  Section?: string;
  PhoneNumber?: string;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};

Admin: {
  Fname?: string;
  Mname?: string;
  Lname?: string;
  AdminID?: string;
  AccID?: number;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};

Teacher: {
  TeacherID?: string;
  AccID?: number;
  Fname?: string;
  Mname?: string;
  Lname?: string;
  Email?: string;
  PhoneNumber?: string;
  Password?: string;
  UserType?: string;
} = {};

CurrentAdmin: {
  Fname?: string;
  Mname?: string;
  Lname?: string;
  AdminID?: string;
  AccID?: number;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};

 CurrentStudent: {
  Fname?: string;
  Mname?: string;
  Lname?: string;
  StudId?: string;
  Grade?: string;
  AccID?: number;
  Section?: string;
  PhoneNumber?: string;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};

CurrentTeacher: {
  TeacherID?: string;
  AccID?: number;
  Fname?: string;
  Mname?: string;
  Lname?: string;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};

  constructor(private http: HttpClient) { }

  sendVerificationEmail(email:string, code: string){
    const url = 'http://localhost/teacher-evaluation-backend/verification.php'; 
    return this.http.post(url, { email, code });
  }

  sendUserInfoToDB() {
  const url = 'http://localhost/teacher-evaluation-backend/api.php'; 
  const userData = {
    action: 'register',
    fname: this.Student.Fname,
    mname: this.Student.Mname,
    lname: this.Student.Lname,
    studid: this.Student.StudId,
    grade: this.Student.Grade,
    section: this.Student.Section,
    phone_number: this.Student.PhoneNumber,
    email: this.Student.Email,
    password: this.Student.Password
  };
  return this.http.post(url, userData);
}

sendAdminInfoToDB() {
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php'; 
  const adminData = {
    action: 'register_admin',
    fname: this.Admin.Fname,
    mname: this.Admin.Mname,
    lname: this.Admin.Lname,
    adminid: this.Admin.AdminID,
    email: this.Admin.Email,
    password: this.Admin.Password,
    usertype: this.Admin.UserType
  };
  return this.http.post(url, adminData);
}

sendTeacherInfoToDB() {
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php'; 
  const teacherData = {
    action: 'register_teacher',
    fname: this.Teacher.Fname,
    mname: this.Teacher.Mname,
    lname: this.Teacher.Lname,
    teacherid: this.Teacher.TeacherID,
    email: this.Teacher.Email,
    password: this.Teacher.Password,
    usertype: this.Teacher.UserType
  };
  return this.http.post(url, teacherData);
}


loginUser(email: string, password: string, rememberme: boolean) {
  const url = 'http://localhost/teacher-evaluation-backend/api.php';
  const loginData = {
    action: 'login',
    email: email,
    rememberme: rememberme,
    password: password
  };

  return this.http.post<any>(url, loginData);
}

checkEmailExists(email: string) {
  const url = 'http://localhost/teacher-evaluation-backend/api.php';
  const data = {
    action: 'check_email',
    email: email
  };
  return this.http.post<any>(url, data);
}

checkStudIdExists(studid: string) {
  const url = 'http://localhost/teacher-evaluation-backend/api.php';
  const data = {
    action: 'check_studid',
    studid: studid
  };
  return this.http.post<any>(url, data);
}

logout() {
  const url = 'http://localhost/teacher-evaluation-backend/api.php';

    const data = {
    action: 'logout'
  };

  return this.http.post<any>(url, data);
}

getStudentCount() {
  const url = 'http://localhost/teacher-evaluation-backend/admindashboard.php';
  const data = {
    action: 'count_students'
  };
  return this.http.post<any>(url, data);
}

getTeacherCount() {
  const url = 'http://localhost/teacher-evaluation-backend/admindashboard.php';
  const data = {
    action: 'count_teachers'
  };
  return this.http.post<any>(url, data);
}

getAccount(){
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
    const data = {
    action: 'getUserAccount'
  };
  return this.http.post<any>(url,data);
}

getYearSection(yearSecId: number) {
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const data = {
    action: 'getYearSection',
    yearsecid: yearSecId  // Pass the parameter here
  };
  return this.http.post<any>(url, data);
}

updateStudent() {
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const studentData = {
    action: 'updateStudent',
    studid: this.Student.StudId,
    fname: this.Student.Fname,
    mname: this.Student.Mname,
    lname: this.Student.Lname,
    grade: this.Student.Grade,
    section: this.Student.Section,
    phone: this.Student.PhoneNumber,
    email: this.Student.Email,
    accid: this.Student.AccID,
    password: this.Student.Password
  };
  return this.http.post<any>(url, studentData);
}


updateTeacher() {
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const teacherData = {
    action: 'updateTeacher',
    teacherid: this.Teacher.TeacherID,
    fname: this.Teacher.Fname,
    mname: this.Teacher.Mname,
    lname: this.Teacher.Lname,
    phone: this.Teacher.PhoneNumber,
    email: this.Teacher.Email,
    accid: this.Teacher.AccID,
    usertype: this.Teacher.UserType,
    password: this.Teacher.Password
  };
  return this.http.post<any>(url, teacherData);
}


updateAdmin() {
  const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const adminData = {
    action: 'updateAdmin',
    adminid: this.Admin.AdminID,
    fname: this.Admin.Fname,
    mname: this.Admin.Mname,
    lname: this.Admin.Lname,
    email: this.Admin.Email,
    accid: this.Admin.AccID,
    usertype: this.Admin.UserType,
    password: this.Admin.Password
  };
  return this.http.post<any>(url, adminData);
}

getAllQuestionnaireIDs() {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getAllQIDs'
  };
  return this.http.post<any>(url, payload);
}

getQuestionsByQID(qid: number) {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getQuestionsByQID',
    QID: qid
  };
  return this.http.post<any>(url, payload);
}

getAllCategories() {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getAllCategories'
  };
  return this.http.post<any>(url, payload);
}

saveQuestionnaire(qid: number, questions: any[]) {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'saveQuestionnaire',
    QID: qid,
    questions: questions
  };
  return this.http.post<any>(url, payload);
}

addSingleQuestionToQuestionnaire(qid: number, question: { text: string, type: string, category: string }) {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'addSingleQuestion',
    QID: qid,
    question: question
  };

  return this.http.post<any>(url, payload);
}

addCategory(categoryName: string) {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'addCategory',
    categoryName: categoryName
  };
  return this.http.post<any>(url, payload);
}

deleteCategoryFromDB(catID: number) {
  const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'deleteCategory',
    catID: catID
  };
  return this.http.post<any>(url, payload);
}

}

