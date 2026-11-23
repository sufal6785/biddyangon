import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAcademics from './pages/admin/AdminAcademics';
import AdminPeople from './pages/admin/AdminPeople';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminFinance from './pages/admin/AdminFinance';
import AdminResultsQueue from './pages/admin/AdminResultsQueue';
import AdminComplaints from './pages/admin/AdminComplaints';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarksEntry from './pages/teacher/TeacherMarksEntry';
import TeacherQuestionBank from './pages/teacher/TeacherQuestionBank';
import TeacherSalary from './pages/teacher/TeacherSalary';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentFees from './pages/student/StudentFees';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import StudentExams from './pages/student/StudentExams';
import StudentExamTaking from './pages/student/StudentExamTaking';
import StudentComplaints from './pages/student/StudentComplaints';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger py-4 rounded-4 shadow-sm">
          <h4><i className="bi bi-shield-x me-2"></i>Access Denied</h4>
          <p className="mb-0">You do not have permission to view this section.</p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-vh-100 d-flex flex-column bg-light">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academics"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAcademics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/people"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPeople />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/enrollments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminEnrollments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/finance"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminFinance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminResultsQueue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/marks"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherMarksEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/questions"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherQuestionBank />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/salary"
                element={
                  <ProtectedRoute allowedRoles={['TEACHER']}>
                    <TeacherSalary />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/fees"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentFees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentExams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams/take/:examId"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentExamTaking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams/attempt/:attemptId"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentExamTaking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
