import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/admin/')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading administrative dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Admin Overview</h3>
          <p className="text-muted small">Real-time coaching operations & financial ledger</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/finance" className="btn btn-outline-success btn-sm">
            <i className="bi bi-plus-circle me-1"></i> New Payment
          </Link>
          <Link to="/admin/enrollments" className="btn btn-primary btn-sm">
            <i className="bi bi-person-plus me-1"></i> Enroll Student
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Total Students</div>
              <h2 className="fw-bold mb-1 text-primary">{data?.total_students || 0}</h2>
              <div className="small text-muted"><i className="bi bi-people me-1"></i>Active enrollments</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-info border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Faculty Teachers</div>
              <h2 className="fw-bold mb-1 text-info">{data?.total_teachers || 0}</h2>
              <div className="small text-muted"><i className="bi bi-person-video3 me-1"></i>Instructors & mentors</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-success border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Total Revenue (Ledger)</div>
              <h2 className="fw-bold mb-1 text-success">৳{Number(data?.total_revenue || 0).toLocaleString()}</h2>
              <div className="small text-muted"><i className="bi bi-cash-stack me-1"></i>Student payments</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-danger border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Net Balance</div>
              <h2 className={`fw-bold mb-1 ${(data?.net_balance || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                ৳{Number(data?.net_balance || 0).toLocaleString()}
              </h2>
              <div className="small text-muted">Expenses: ৳{Number(data?.total_expenditure || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Badges / Alert Highlights */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="alert alert-warning d-flex justify-content-between align-items-center mb-0 py-2 shadow-sm">
            <div>
              <i className="bi bi-award me-2 fs-5"></i>
              <strong>{data?.pending_results_count || 0}</strong> Results Pending
            </div>
            <Link to="/admin/results" className="btn btn-warning btn-sm">Review</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="alert alert-info d-flex justify-content-between align-items-center mb-0 py-2 shadow-sm">
            <div>
              <i className="bi bi-question-circle me-2 fs-5"></i>
              <strong>{data?.pending_questions_count || 0}</strong> Questions Pending
            </div>
            <Link to="/admin/results" className="btn btn-info btn-sm text-white">Review</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0 py-2 shadow-sm">
            <div>
              <i className="bi bi-chat-dots me-2 fs-5"></i>
              <strong>{data?.open_complaints_count || 0}</strong> Open Complaints
            </div>
            <Link to="/admin/complaints" className="btn btn-danger btn-sm">Address</Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold"><i className="bi bi-receipt me-2 text-success"></i>Recent Payments</h6>
              <Link to="/admin/finance" className="small text-decoration-none">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Receipt</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recent_payments && data.recent_payments.length > 0 ? (
                    data.recent_payments.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold text-primary">{p.receipt_no}</td>
                        <td>{p.student_name}</td>
                        <td>{p.course_name}</td>
                        <td className="fw-bold text-success">৳{p.amount.toLocaleString()}</td>
                        <td className="small text-muted">{p.paid_on}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold"><i className="bi bi-envelope-exclamation me-2 text-danger"></i>Recent Complaints</h6>
              <Link to="/admin/complaints" className="small text-decoration-none">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Subject</th>
                    <th>Student</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recent_complaints && data.recent_complaints.length > 0 ? (
                    data.recent_complaints.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.subject}</td>
                        <td className="small">{c.student_username}</td>
                        <td>
                          <span className={`badge ${c.status === 'RESOLVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">No grievances submitted.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
