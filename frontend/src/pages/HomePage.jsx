import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, role, user } = useAuth();

  const getDashboardLink = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-white py-5 border-bottom">
        <div className="container py-4 text-center">
          <div className="d-inline-flex align-items-center justify-content-center p-3 bg-primary-subtle text-primary rounded-circle mb-3 shadow-sm">
            <i className="bi bi-mortarboard-fill" style={{ fontSize: '2.5rem' }}></i>
          </div>
          <h1 className="display-5 fw-bold text-dark mb-2">Biddyangon Coaching Management System</h1>
          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '700px' }}>
            A unified, multi-role coaching platform: academic routines, roll-number accounts, append-only financial ledgers, dynamic teacher remuneration, and fee-gated online assessments.
          </p>

          <div className="d-flex justify-content-center gap-3">
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm">
                <i className="bi bi-speedometer2 me-2"></i>Go to {role} Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm">
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
              <div className="card-body">
                <div className="p-3 bg-danger-subtle text-danger rounded-3 d-inline-block mb-3">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h5 className="fw-bold">Role-Based Access Control</h5>
                <p className="text-muted small mb-0">
                  Strict authorization boundaries across Admin, Teacher, and Student roles with scoped data isolation and profile management.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
              <div className="card-body">
                <div className="p-3 bg-success-subtle text-success rounded-3 d-inline-block mb-3">
                  <i className="bi bi-cash-stack fs-3"></i>
                </div>
                <h5 className="fw-bold">Append-Only Financial Ledger</h5>
                <p className="text-muted small mb-0">
                  Permanent transaction audit trail with zero stored totals, money receipt generation, and real-time teacher remuneration calculation based on sessions held.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
              <div className="card-body">
                <div className="p-3 bg-primary-subtle text-primary rounded-3 d-inline-block mb-3">
                  <i className="bi bi-laptop fs-3"></i>
                </div>
                <h5 className="fw-bold">Fee-Gated Online Exams</h5>
                <p className="text-muted small mb-0">
                  Server-side fee verification ensuring only students with cleared tuition can access computer-based MCQ assessments, with live auto-grading and scorecards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials Section */}
        <div className="card border-0 bg-light rounded-4 p-4 mt-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h5 className="fw-bold mb-1">Explore With Pre-Seeded Accounts</h5>
              <p className="text-muted small mb-0">
                You can immediately test any role using our pre-seeded demonstration accounts:
              </p>
            </div>
            <div className="col-lg-6 mt-3 mt-lg-0">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <span className="badge bg-danger p-2">Admin: admin / admin123</span>
                <span className="badge bg-primary p-2">Teacher: teacher1 / teacher123</span>
                <span className="badge bg-success p-2">Student: ssc26-001 / student123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
