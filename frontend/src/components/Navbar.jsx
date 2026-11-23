import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'ADMIN':
        return <span className="badge bg-danger">Admin</span>;
      case 'TEACHER':
        return <span className="badge bg-primary">Teacher</span>;
      case 'STUDENT':
        return <span className="badge bg-success">Student</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="bi bi-mortarboard-fill text-warning fs-4 me-2"></i>
          <span>Biddyangon</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated && role === 'ADMIN' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/academics">
                    <i className="bi bi-book me-1"></i> Academics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/people">
                    <i className="bi bi-people me-1"></i> People
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/enrollments">
                    <i className="bi bi-person-check me-1"></i> Enrollments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/finance">
                    <i className="bi bi-cash-coin me-1"></i> Finance
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/results">
                    <i className="bi bi-check-circle me-1"></i> Approvals
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/complaints">
                    <i className="bi bi-chat-left-dots me-1"></i> Complaints
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && role === 'TEACHER' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/teacher/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/teacher/attendance">
                    <i className="bi bi-calendar-check me-1"></i> Attendance
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/teacher/marks">
                    <i className="bi bi-pencil-square me-1"></i> Enter Marks
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/teacher/questions">
                    <i className="bi bi-patch-question me-1"></i> Question Bank
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/teacher/salary">
                    <i className="bi bi-wallet2 me-1"></i> Salary
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && role === 'STUDENT' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/fees">
                    <i className="bi bi-credit-card me-1"></i> Fees & Dues
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/attendance">
                    <i className="bi bi-clock-history me-1"></i> Attendance
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/results">
                    <i className="bi bi-trophy me-1"></i> Results
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/exams">
                    <i className="bi bi-laptop me-1"></i> Online Exams
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/complaints">
                    <i className="bi bi-envelope-paper me-1"></i> Grievances
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <li className="nav-item me-3 text-light d-flex align-items-center gap-2">
                  <span>
                    <strong>{user?.first_name || user?.username}</strong>
                  </span>
                  {getRoleBadge(role)}
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm me-2" to="/profile">
                    <i className="bi bi-person-gear me-1"></i> Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-warning btn-sm fw-semibold" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
