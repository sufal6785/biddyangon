import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/teacher/')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Teacher Workspace</h3>
          <p className="text-muted small">Daily routine, attendance taking, marks entry, and remuneration status</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/teacher/attendance" className="btn btn-primary btn-sm">
            <i className="bi bi-calendar-check me-1"></i> Mark Attendance
          </Link>
          <Link to="/teacher/marks" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-pencil-square me-1"></i> Enter Marks
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Assigned Courses</div>
              <h2 className="fw-bold mb-1 text-primary">{data?.assigned_courses_count || 0}</h2>
              <div className="small text-muted">Active teaching subjects</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-info border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Sessions Held (This Month)</div>
              <h2 className="fw-bold mb-1 text-info">{data?.sessions_held_month || 0}</h2>
              <div className="small text-muted">Classes conducted</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-success border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Accrued Remuneration</div>
              <h2 className="fw-bold mb-1 text-success">৳{Number(data?.monthly_salary || 0).toLocaleString()}</h2>
              <div className="small text-muted">Calculated on sessions held</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-warning border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Pending Mark Submissions</div>
              <h2 className="fw-bold mb-1 text-warning">{data?.pending_results || 0}</h2>
              <div className="small text-muted">Awaiting admin sign-off</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Upcoming Exams */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-clock me-2 text-primary"></i>Today's Routine Schedule</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Time</th>
                    <th>Course</th>
                    <th>Section</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.today_routine && data.today_routine.length > 0 ? (
                    data.today_routine.map((slot) => (
                      <tr key={slot.id}>
                        <td className="fw-semibold">{slot.start_time} - {slot.end_time}</td>
                        <td>{slot.course_name}</td>
                        <td>{slot.section_name}</td>
                        <td><span className="badge bg-light text-dark border">{slot.room}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">No classes scheduled for today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-calendar2-event me-2 text-info"></i>Upcoming Course Exams</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Date</th>
                    <th>Exam Title</th>
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.upcoming_exams && data.upcoming_exams.length > 0 ? (
                    data.upcoming_exams.map((ex) => (
                      <tr key={ex.id}>
                        <td className="small text-muted">{ex.date}</td>
                        <td className="fw-semibold">{ex.title}</td>
                        <td>{ex.course_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">No upcoming exams scheduled.</td>
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
