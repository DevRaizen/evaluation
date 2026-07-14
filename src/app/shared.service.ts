import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  defaultAvatar = "user.png";

  Student: {
    Fname?: string;
    Mname?: string;
    Lname?: string;
    StudId?: string;
    Grade?: string;
    Status?: string;
    AccID?: number;
    Section?: string;
    Email?: string;
    Password?: string;
    UserType?: string;
  } = {};

  Admin: {
    Fname?: string;
    Mname?: string;
    Lname?: string;
    AdminID?: string;
    Status?: string;
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
    Status?: string;
    PhoneNumber?: string;
    Password?: string;
    UserType?: string;
  } = {};

  Principal: {
    PrincipalID?: string;
    AccID?: number;
    Fname?: string;
    Mname?: string;
    Lname?: string;
    Email?: string;
    Status?: string;
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
  schedmod: boolean = false;
  addaccmod: boolean = false;
  addquesmod: boolean = false;
  CurrentStudent: {
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

  CurrentPrincipal: {
    PrincipalID?: string;
    AccID?: number;
    Fname?: string;
    Mname?: string;
    Lname?: string;
    Email?: string;
    Status?: string;
    PhoneNumber?: string;
    Password?: string;
    UserType?: string;
  } = {};

 getWithExpiry(key: string) {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
      sessionStorage.removeItem(key); // remove expired
      return null;
    }

    return item.data;
  } catch (e) {
    console.error('Invalid sessionStorage JSON:', key, e);
    return null;
  }
}

  //burl = 'https://61rr1xns-80.asse.devtunnels.ms/teacher-evaluation-backend/'
  burl = 'https://evaluationbackend-production-afcd.up.railway.app/';
  constructor(private http: HttpClient) { }

  sendVerificationEmail(email:string, code: string){
    const url = `${this.burl}verification.php` 
    //const url = 'http://localhost/teacher-evaluation-backend/verification.php'; 
    return this.http.post(url, { email, code });
  }

  sendUserInfoToDB() {
  const url = `${this.burl}api.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/api.php'; 
  const userData = {
    action: 'register',
    fname: this.Student.Fname,
    mname: this.Student.Mname,
    lname: this.Student.Lname,
    studid: this.Student.StudId,
    grade: this.Student.Grade,
    section: this.Student.Section,
    email: this.Student.Email,
    password: this.Student.Password
  };
  return this.http.post(url, userData);
}

sendAdminInfoToDB() {
  const url = `${this.burl}manageuser.php` 
  //const url = ' '; 
  const adminData = {
    action: 'register_admin',
    fname: this.Admin.Fname,
    mname: this.Admin.Mname,
    lname: this.Admin.Lname,
    adminid: this.Admin.AdminID,
    email: this.Admin.Email,
    password: this.Admin.Password,
    usertype: this.Admin.UserType,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
      AccID: this.CurrentAdmin.AccID
  };
  return this.http.post(url, adminData);
}

getPendingStudents() {
  const url = `${this.burl}api.php`; 
  return this.http.post(url, { action: 'get_pending_students' });
}
 approveStudent(studID: string) {
   const url = `${this.burl}api.php`; 
    const data = {
      action: 'approve_student',
      StudID: studID,
      Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
      AccID: this.CurrentAdmin.AccID

    };
    return this.http.post(url, data);
  }

 
  rejectStudent(studID: string){
    const url = `${this.burl}api.php`; 
    const data = {
      action: 'reject_student',
      StudID: studID,
      Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
      AccID: this.CurrentAdmin.AccID
    };
    return this.http.post(url, data);
  }


sendTeacherInfoToDB() {
  const url = `${this.burl}manageuser.php` 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php'; 
  const teacherData = {
    action: 'register_teacher',
    fname: this.Teacher.Fname,
    mname: this.Teacher.Mname,
    lname: this.Teacher.Lname,
    teacherid: this.Teacher.TeacherID,
    email: this.Teacher.Email,
    password: this.Teacher.Password,
    usertype: this.Teacher.UserType,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post(url, teacherData);
}
sendPrincipalInfoToDB() {
  const url = `${this.burl}manageuser.php` 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php'; 
  const principalData = {
    action: 'register_principal',
    fname: this.Principal.Fname,
    mname: this.Principal.Mname,
    lname: this.Principal.Lname,
    principalid: this.Principal.PrincipalID,
    email: this.Principal.Email,
    password: this.Principal.Password,
    usertype: this.Principal.UserType,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post(url, principalData);
}


loginUser(email: string, password: string, rememberme: boolean) {
  const url = `${this.burl}api.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/api.php';
  const loginData = {
    action: 'login',
    email: email,
    rememberme: rememberme,
    password: password
  };

  return this.http.post<any>(url, loginData);
}

checkEmailExists(email: string) {
  const url = `${this.burl}api.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/api.php';
  const data = {
    action: 'check_email',
    email: email
  };
  return this.http.post<any>(url, data);
}

checkStudIdExists(studid: string) {
  const url = `${this.burl}api.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/api.php';
  const data = {
    action: 'check_studid',
    studid: studid
  };
  return this.http.post<any>(url, data);
}

logout() {
  const url = `${this.burl}api.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/api.php';

    const data = {
    action: 'logout'
  };

  return this.http.post<any>(url, data);
}

getStudentCount() {
  const url = `${this.burl}admindashboard.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/admindashboard.php';
  const data = {
    action: 'count_students'
  };
  return this.http.post<any>(url, data);
}

getTeacherCount() {
  const url = `${this.burl}admindashboard.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/admindashboard.php';
  const data = {
    action: 'count_teachers'
  };
  return this.http.post<any>(url, data);
}
getStudCountbyGrade() {
  const url = `${this.burl}admindashboard.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/admindashboard.php';
  const data = {
    action: 'count_students_by_grade'
  };
  return this.http.post<any>(url, data);
}
getStudCountbyGradereport(SchoolYearID: number) {
  const url = `${this.burl}gen-report.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/admindashboard.php';
  const data = {
    action: 'count_students_by_grade',
    SchoolYearID: SchoolYearID
  };
  return this.http.post<any>(url, data);
}

getAccount(){
  const url = `${this.burl}manageuser.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
    const data = {
    action: 'getUserAccount'
  };
  return this.http.post<any>(url,data);
}


getYearSection(yearSecId: number) {
  const url = `${this.burl}manageuser.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const data = {
    action: 'getYearSection',
    yearsecid: yearSecId  // Pass the parameter here
  };
  return this.http.post<any>(url, data);
}


updateStudent() {
  const url = `${this.burl}manageuser.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const studentData = {
    action: 'updateStudent',
    studid: this.Student.StudId,
    fname: this.Student.Fname,
    mname: this.Student.Mname,
    lname: this.Student.Lname,
    grade: this.Student.Grade,
    section: this.Student.Section,
    status: this.Student.Status,
    email: this.Student.Email,
    accid: this.Student.AccID,
    password: this.Student.Password,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post<any>(url, studentData);
}


updateTeacher() {
  const url = `${this.burl}manageuser.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const teacherData = {
    action: 'updateTeacher',
    teacherid: this.Teacher.TeacherID,
    fname: this.Teacher.Fname,
    mname: this.Teacher.Mname,
    lname: this.Teacher.Lname,
    phone: this.Teacher.PhoneNumber,
    email: this.Teacher.Email,
    status: this.Teacher.Status,
    accid: this.Teacher.AccID,
    usertype: this.Teacher.UserType,
    password: this.Teacher.Password,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post<any>(url, teacherData);
}


updateAdmin() {
  const url = `${this.burl}manageuser.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const adminData = {
    action: 'updateAdmin',
    adminid: this.Admin.AdminID,
    fname: this.Admin.Fname,
    mname: this.Admin.Mname,
    lname: this.Admin.Lname,
    email: this.Admin.Email,
    accid: this.Admin.AccID,
    usertype: this.Admin.UserType,
    password: this.Admin.Password,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post<any>(url, adminData);
}

updatePrincipal() {
  const url = `${this.burl}manageuser.php`;
  const principalData = {
    action: 'updatePrincipal',
    principalid: this.Principal.PrincipalID,
    fname: this.Principal.Fname,
    mname: this.Principal.Mname,
    lname: this.Principal.Lname,
    email: this.Principal.Email,
    status: this.Principal.Status,
    accid: this.Principal.AccID,
    usertype: this.Principal.UserType,
    password: this.Principal.Password,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post<any>(url, principalData);
}

deleteAccount(AccID: number) {
  const url = `${this.burl}manageuser.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/manageuser.php';
  const payload = {
    action: 'deleteAccount',
    accid: AccID,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post<any>(url, payload);
}

updateEmail(AccID: number,NewEmail: string){
 const url = `${this.burl}adminsettings.php`;
  const payload = {
    action: 'updateEmail',
    newemail: NewEmail,
    accid: AccID
}

return this.http.post<any>(url, payload);
}

updatePassword(AccID: number,NewPass: string){
 const url = `${this.burl}adminsettings.php`;
  const payload = {
    action: 'updatePassword',
    newpassword: NewPass,
    accid: AccID
}

return this.http.post<any>(url, payload);
}

getAllQuestionnaireIDs() {
  const url = `${this.burl}questions.php`; 
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getAllQIDs'
  };
  return this.http.post<any>(url, payload);
}

getQuestionsByQID(qid: number) {
  const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getQuestionsByQID',
    QID: qid
  };
  return this.http.post<any>(url, payload);
}

getAllCategories() {
  const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getAllCategories'
  };
  return this.http.post<any>(url, payload);
}

saveQuestionnaire(qid: number, questions: any[]) {
  const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'saveQuestionnaire',
    QID: qid,
    questions: questions,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };
  return this.http.post<any>(url, payload);
}


deleteQuestion(quesID: string) {
  const url = `${this.burl}questions.php`;
  const payload = {
    action: 'deleteQuestion',
    QuesID: quesID
  };
  return this.http.post<any>(url, payload);
}

updateQuestionText(QuesID: number, questionText: string) {
  const url = `${this.burl}questions.php`;
  const payload = {
    action: 'updateQuestionText',
    QuesID,
    questionText
  }
  return this.http.post<any>(url,payload );
}


addSingleQuestionToQuestionnaire(qid: number, question: { text: string, type: string, category: string }) {
  const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'addSingleQuestion',
    QID: qid,
    question: question,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname
  };

  return this.http.post<any>(url, payload);
}

addCategory(categoryName: string) {
   const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'addCategory',
    categoryName: categoryName
  };
  return this.http.post<any>(url, payload);
}

deleteCategoryFromDB(catID: number) {
   const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'deleteCategory',
    catID: catID
  };
  return this.http.post<any>(url, payload);
}

updateCategory(catID: number, newCategoryName: string) {
   const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'updateCategory',
    catID: catID,
    categoryName: newCategoryName
  };
  return this.http.post<any>(url, payload);
}



getStudentQuestionsByQID(qid: number) {
  const url = `${this.burl}questions.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/questions.php';
  const payload = {
    action: 'getStudentQuestionsByQID',
    QID: qid
  };
  return this.http.post<any>(url, payload);
}

createSchedule(scheduleData: {
  title: string;
  questionnaireID: number;
  startDate: string;
  endDate: string;
  status: string;
  targetGrades: string[];
  schoolYearID: number;
  adminID: string;
}) {
  const url = `${this.burl}evalSched.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/evalSched.php';
  const payload = {
    action: 'createSchedule',
    schedule: {
      title: scheduleData.title,
      questionnaireID: scheduleData.questionnaireID,
      startDate: scheduleData.startDate,
      endDate: scheduleData.endDate,
      status: scheduleData.status,
      targetGrades: scheduleData.targetGrades,
      schoolYearID: scheduleData.schoolYearID,
      adminID: scheduleData.adminID,
      Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
      AccID: this.CurrentAdmin.AccID
    }
  };

  return this.http.post<any>(url, payload);
}

getEvaluationSettings(){
   const url = `${this.burl}evalSched.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/evalSched.php';
  const payload = {
    action: 'getEvaluationSettings'
  };

  return this.http.post<any>(url,payload);
}

getAllEvaluationSettings(){
   const url = `${this.burl}evalSched.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/evalSched.php';
  const payload = {
    action: 'getEvaluationAllSettings'
  };

  return this.http.post<any>(url,payload);
}

getgenAllEvaluationSettings(){
   const url = `${this.burl}gen-report.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/evalSched.php';
  const payload = {
    action: 'getEvaluationAllSettings'
  };

  return this.http.post<any>(url,payload);
}

saveSettings(schedule: any){
   const url = `${this.burl}evalSched.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/evalSched.php';
  const payload = {
    action: 'updateEvaluationSettings',
    schedule: schedule,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };

  return this.http.post<any>(url,payload);
}

deleteEvaluationSetting(id: number) {
   const url = `${this.burl}evalSched.php`;
  //const url = 'http://localhost/teacher-evaluation-backend/evalSched.php';
  const payload = {
    action: 'deleteEvaluationSetting',
    id: id
  };
  return this.http.post<any>(url, payload);
}

saveProfile(profileData: any, selectedFile: File) {
  const url = `${this.burl}saveProfile.php`; // Your PHP endpoint

   const formData = new FormData();
  formData.append('action', 'saveProfile');
  formData.append('userid', profileData.userid);
  formData.append('userRole', profileData.userRole);
  formData.append('userImage', selectedFile); 

  return this.http.post<any>(url, formData);
}

getProfile(profileData: any) {
  const url = `${this.burl}saveProfile.php`; 

   const payload = {
    action: 'getProfile',
    userid: profileData.userid,
    userRole: profileData.userRole
  };
  return this.http.post<any>(url, payload);
}

getYearSec(){
  const url = `${this.burl}tsubjectmap.php`;
  const payload ={
    action: 'getYearSec'
  };

return this.http.post<any>(url,payload)
};

getSubPerYEar(grade: string){
  const url = `${this.burl}tsubjectmap.php`;
    const payload ={
    action: 'getSubPerYear',
    grade: grade
  };

  return this.http.post<any>(url,payload)
}

getSchoolYear(){
   const url = `${this.burl}tsubjectmap.php`;
    const payload ={
    action: 'getSchoolYear',
  };

  return this.http.post<any>(url,payload)
}

getActiveSchoolYear(){
   const url = `${this.burl}tsubjectmap.php`;
    const payload ={
    action: 'getActiveSchoolYear',
  };

  return this.http.post<any>(url,payload)
}

getSchoolYears(){
   const url = `${this.burl}adminsettings.php`;
    const payload ={
    action: 'getSchoolYears',
  };

  return this.http.post<any>(url,payload)
}

addSchoolYear(schoolYear: string) {
  const url = `${this.burl}adminsettings.php`;
  const payload = {
    action: 'addSchoolYear',
    SchoolYear: schoolYear,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  }
  return this.http.post<any>(url, payload);
}

getActiveSchoolYears() {
  const url = `${this.burl}adminsettings.php`;
  const payload = {
    action: 'getActiveSchoolyear'
  }
  return this.http.post<any>(url, payload);
}

setActiveSchoolYear(SchoolYearID: number) {
   const url = `${this.burl}adminsettings.php`;
    const payload = {
    action: 'setActiveSchoolYear',
    NewActiveID: SchoolYearID,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  }
  return this.http.post<any>(url, payload);
}


saveSubjectMapping(load: any) {
  const url = `${this.burl}tsubjectmap.php`;

    const payload ={
    action: 'saveSubjectMapping',
      teacherID: load.teacherID,
      subjectID: load.subjectID,
      grade: load.grade,
      sections: load.sections,
      schoolYearID: load.schoolYearID,
      Teacher: this.CurrentTeacher.Fname + ' ' + this.CurrentTeacher.Mname + ' ' + this.CurrentTeacher.Lname,
      AccID: this.CurrentTeacher.AccID
  };

  return this.http.post<any>(url,payload);
}

getTeacherSubjectMappings(teacherID: string) {
  const url = `${this.burl}tsubjectmap.php`;
  const payload = {
    action: 'getTeacherMappings',
    teacherID: teacherID
  };

  return this.http.post<any>(url, payload);
}

getTeacherOfStudent(StudID: string) {
  const url = `${this.burl}stdashboard.php`;
  const payload = {
    action: 'getTeacher',
    StudID: StudID
  };

  return this.http.post<any>(url, payload);
}

submitEvaluation(payload: {
  StudID: string;
  TeacherID: string;
  SubjectID: string;
  ESetID: number;
  SchoolYearID: string;
  answers: {
  [catID: number]: { [questionId: number]: number | string }
};
Optionalanswers: {
  [catID: number]: { [questionId: number]: number | string }
};

}) {
  const url = `${this.burl}evaluation.php`;
  const body = {
    action: 'submitEvaluation',
    ...payload,
    Student: this.CurrentStudent.Fname + ' ' + this.CurrentStudent.Mname + ' ' + this.CurrentStudent.Lname,
    AccID: this.CurrentStudent.AccID
  };

  return this.http.post<any>(url, body);
}
getAllTeachers() {
  const url = `${this.burl}ViewTeacherReport.php`;
  const payload = {
    action: 'getAllTeachers'
  };
  return this.http.post<any>(url, payload);
}

getUnevaluatedTeachers(studId: string, eSetId: string) {
  const url = `${this.burl}stdashboard.php`; // adjust if different
  const payload = {
    action: 'getUnevaluatedTeachers',
    StudID: studId,
    ESetID: eSetId
  };
  return this.http.post<any>(url, payload);
}

getTeacherDashboardData(teacherId: string, schoolYearID: string) {
  const url = `${this.burl}tdashboard.php`; 
  const payload = {
    action: 'getTeacherDashboardData',
    TeacherID: teacherId,
    SchoolYearID: schoolYearID
  };
  return this.http.post<any>(url, payload);
}

getTeacherStudentCount(teacherId: string, schoolYearID: string) {
  const url = `${this.burl}tdashboard.php`;
  const payload = {
    action: 'getTeacherStudentCount',
    TeacherID: teacherId,
    SchoolYearID: schoolYearID
  };
  return this.http.post<any>(url, payload);
}

getTeacherResponseCount(teacherId: string, schoolYearID: string) {
  const url = `${this.burl}tdashboard.php`;
  const payload = {
    action: 'getTeacherResponseCount',
    TeacherID: teacherId,
    SchoolYearID: schoolYearID
  };
  return this.http.post<any>(url, payload);
}

getTeacherFeedback(teacherId: string, schoolYearID: string) {
  const url = `${this.burl}tdashboard.php`;
  const payload = {
    action: 'getTeacherFeedback',
    TeacherID: teacherId,
    SchoolYearID: schoolYearID
  };
  return this.http.post<any>(url, payload);
}

getGradeLevels() { 
  const url = `${this.burl}gen-report.php`;
  const payload = { action: 'getGradeLevels' };
  return this.http.post<any>(url, payload);
}

getEvaluationAverageByGrade(schoolYearID: string, gradeLevel: string, QID: string) {
  const url = `${this.burl}gen-report.php`;
  const payload = {
    action: 'getEvaluationAverageByGrade',
    SchoolYearID: schoolYearID,
    GradeLevel: gradeLevel,
    QID: QID
  };
  return this.http.post<any>(url, payload);
}

getTrendAnalysisByGrade(gradeLevel: string) {
  const url = `${this.burl}gen-report.php`;
  const body = {
                 action: 'getTrendAnalysisByGrade',
                 GradeLevel: gradeLevel };
  return this.http.post<any>(url, body);
}

getEvaluationResponseCountByGrade(
  schoolYearID: string,
  gradeLevel: string,
  QID: string
) {

   const url = `${this.burl}gen-report.php`;
  const payload = {
    action: 'getEvaluationResponseCountByGrade',
    SchoolYearID: schoolYearID,
    GradeLevel: gradeLevel,
    QID: QID
  };

  return this.http.post<any>(url, payload);
}

getEvaluationCategoryBreakdownByGrade(schoolYearID: string, gradeLevel: string,QID: string){
  const url = `${this.burl}gen-report.php`;
  const payload = {
    action: 'getEvaluationCategoryBreakdownByGrade',
    SchoolYearID: schoolYearID,
    GradeLevel: gradeLevel,
    QID: QID
  }
  return this.http.post<any>(url, payload);
}

getSubmissionCountByGrade(schoolYearID: string, QID: string) {
  const url = `${this.burl}gen-report.php`; // adjust to your PHP file
  const payload = {
    action: 'getSubmissionCountByGrade',
    SchoolYearID: schoolYearID,
    QID: QID
  };
  return this.http.post<any>(url, payload);
}

getTop3TeachersByAverage(schoolYearID: any) {
  const url = `${this.burl}admindashboard.php`; 
  const payload = {
    action: 'getTop3TeachersByAverage',
    SchoolYearID: schoolYearID
  };
  return this.http.post<any>(url, payload);
}

getHighestCategory(teacherID: string, schoolYearID: number) {

   const url = `${this.burl}admindashboard.php`; 
  const payload ={
    action: 'getHighestCategory',
    TeacherID: teacherID,
    SchoolYearID: schoolYearID
  }
  return this.http.post<any>(url, payload );
}

getRawSubmissionCountByGrade(ActiveSet: number){

const url = `${this.burl}admindashboard.php`; 
  const payload = {
      action: 'getRawSubmissionCountByGrade',
      ESetID: ActiveSet
    }
  return this.http.post<any>(url,payload);
}

 saveNewQuestionnaire(title: string, questions: any[]){
    const url = `${this.burl}questions.php`;
    const payload = {
      action: 'saveNewQuestionnaire',
      title,
      questions,
      Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
      AccID: this.CurrentAdmin.AccID
    };
    return this.http.post<any>(url, payload);
  }

 getLogs() {
  const url = `${this.burl}adminsettings.php`
  const payload = { action: 'getLogs' };
  return this.http.post<any>(url, payload);
}

addSection(grade: string, sectionName: string) {
  const url = `${this.burl}adminsettings.php`
  const payload = {
    action: 'addSection',
    grade,
    sectionName,
    Admin: this.CurrentAdmin.Fname + ' ' + this.CurrentAdmin.Mname + ' ' + this.CurrentAdmin.Lname,
    AccID: this.CurrentAdmin.AccID
  };

  return this.http.post<any>(url, payload);
}


// shared.service.ts
renewEnrollment(accID: number, studID: string, yearLevel: string, section: string) {
  const url = `${this.burl}stdashboard.php`
  const payload = {
    action: 'renewEnrollment',
    accID,
    studID,
    yearLevel,
    section
  };

  return this.http.post<any>(url, payload);
}

getExistingQuestions() {
  const url  = `${this.burl}questions.php`
  const payload = { action: 'getExistingQuestions' };
  return this.http.post<any>(url, payload);
}

deleteSubjectMapping(mapping: any) {
  const url = `${this.burl}tsubjectmap.php`;

  const payload = {
    action: 'deleteSubjectMapping',
    teacherID: mapping.teacherID,
    subjectID: mapping.subjectID,
    sectionName: mapping.sectionName,
    schoolYearID: mapping.schoolYearID,
    Teacher: this.CurrentTeacher.Fname + ' ' + this.CurrentTeacher.Mname + ' ' + this.CurrentTeacher.Lname,
    AccID: this.CurrentTeacher.AccID
  };

  return this.http.post<any>(url, payload);
}

getAllTeacherMapping(schoolYearID: any) {
  const url = `${this.burl}tsubjectmap.php`;

  const payload = {
    action: 'getTeacherSubjectMap',
    schoolYearID: schoolYearID
  };

  return this.http.post<any>(url, payload);
}

checkIfEvaluated(teacherID: any, subjectID: any, schoolYearID: any) {
  const url = `${this.burl}evaluation.php`;

  const payload = {
    action: 'checkIfEvaluated',
    teacherID: teacherID,
    subjectID: subjectID,
    schoolYearID: schoolYearID
  };

  return this.http.post<any>(url, payload);
}



}

