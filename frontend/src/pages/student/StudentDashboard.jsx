import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/student/')
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading student portal...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Student Portal</h3>
          <p className="text-muted small">Academic progress, fee clearance status, class schedule, and assessments</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/student/exams" className="btn btn-primary btn-sm">
            <i className="bi bi-laptop me-1"></i> Take Online Exam
          </Link>
          <Link to="/student/fees" className="btn btn-outline-success btn-sm">
            <i className="bi bi-credit-card me-1"></i> View Fee Balance
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Enrolled Courses</div>
              <h2 className="fw-bold mb-1 text-primary">{data?.enrolled_courses_count || 0}</h2>
              <div className="small text-muted">Active subjects</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-info border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Attendance Rate</div>
              <h2 className="fw-bold mb-1 text-info">{data?.overall_attendance || 100}%</h2>
              <div className="small text-muted">Across all conducted sessions</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-success border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Tuition Paid</div>
              <h2 className="fw-bold mb-1 text-success">৳{Number(data?.total_paid || 0).toLocaleString()}</h2>
              <div className="small text-muted">Total fee: ৳{Number(data?.total_fee || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-danger border-4 rounded-3 h-100">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Remaining Fee Due</div>
              <h2 className={`fw-bold mb-1 ${(data?.total_due || 0) === 0 ? 'text-success' : 'text-danger'}`}>
                ৳{Number(data?.total_due || 0).toLocaleString()}
              </h2>
              <div className="small">
                {(data?.total_due || 0) === 0 ? (
                  <span className="text-success"><i className="bi bi-check-circle me-1"></i>Cleared for exams</span>
                ) : (
                  <span className="text-danger"><i className="bi bi-exclamation-triangle me-1"></i>Due prevents exam entry</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routine & Upcoming Exams */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-calendar3 me-2 text-primary"></i>Today's Class Schedule</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Time</th>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.today_routine && data.today_routine.length > 0 ? (
                    data.today_routine.map((slot) => (
                      <tr key={slot.id}>
                        <td className="fw-semibold">{slot.start_time} - {slot.end_time}</td>
                        <td>{slot.course_name}</td>
                        <td>{slot.teacher_name}</td>
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
              <h6 className="mb-0 fw-bold"><i className="bi bi-award me-2 text-info"></i>Upcoming Assessments</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Date</th>
                    <th>Exam</th>
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
                      <td colSpan="3" className="text-center text-muted py-3">No upcoming exams.</td>
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
