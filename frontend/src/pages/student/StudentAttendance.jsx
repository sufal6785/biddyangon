import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function StudentAttendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/attendance/student/')
      .then((res) => setAttendanceList(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading attendance record...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-clock-history me-2"></i>My Attendance Record</h3>
          <p className="text-muted small">Course syllabus progress, attendance rate, and session history</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {attendanceList.map((c) => (
          <div key={c.course_id} className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">{c.course_name}</h5>
                    <span className="badge bg-secondary">{c.course_code}</span>
                  </div>
                  <div className="text-end">
                    <h3 className="fw-bold text-primary mb-0">{c.attendance_percentage}%</h3>
                    <span className="small text-muted">Attendance Rate</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Sessions Progress:</span>
                    <span>{c.held_sessions} held of {c.total_planned} planned ({c.remaining_sessions} remaining)</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${(c.held_sessions / (c.total_planned || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="row g-2 text-center mb-3">
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3">
                      <div className="fw-bold text-success fs-5">{c.present_count}</div>
                      <div className="small text-muted">Present</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3">
                      <div className="fw-bold text-warning fs-5">{c.late_count}</div>
                      <div className="small text-muted">Late</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3">
                      <div className="fw-bold text-danger fs-5">{c.absent_count}</div>
                      <div className="small text-muted">Absent</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h6 className="fw-bold small text-muted text-uppercase mb-2">Recent Sessions</h6>
                  <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover align-middle mb-0">
                      <tbody>
                        {c.history && c.history.length > 0 ? (
                          c.history.map((h, idx) => (
                            <tr key={idx}>
                              <td className="small text-muted">{h.session_date}</td>
                              <td className="small">{h.topic || 'Class Session'}</td>
                              <td className="text-end">
                                <span className={`badge ${
                                  h.status === 'PRESENT' ? 'bg-success' : h.status === 'LATE' ? 'bg-warning text-dark' : 'bg-danger'
                                }`}>
                                  {h.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted small py-2">No class sessions conducted yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
