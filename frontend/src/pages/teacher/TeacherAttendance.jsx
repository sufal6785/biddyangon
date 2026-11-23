import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rosterData, setRosterData] = useState(null);
  const [selectedSession, setSelectedSession] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Fetch teacher's courses
  useEffect(() => {
    api.get('/api/academics/courses/')
      .then((res) => setCourses(res.data))
      .catch((e) => console.error(e));
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSession('');
    setRosterData(null);
    setAttendanceMap({});
    setMsg(''); setErr('');

    if (!courseId) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/attendance/roster/${courseId}/`);
      setRosterData(res.data);
      if (res.data.sessions && res.data.sessions.length > 0) {
        setSelectedSession(res.data.sessions[0].id);
      }
      // Initialize attendanceMap with PRESENT for all students
      const initialMap = {};
      res.data.students.forEach((s) => {
        initialMap[s.enrollment_id] = 'PRESENT';
      });
      setAttendanceMap(initialMap);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to load roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (status) => {
    if (!rosterData) return;
    const newMap = {};
    rosterData.students.forEach((s) => {
      newMap[s.enrollment_id] = status;
    });
    setAttendanceMap(newMap);
  };

  const handleStatusChange = (enrollmentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [enrollmentId]: status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) {
      setErr('Please select a session to mark attendance.');
      return;
    }
    setSubmitting(true);
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/attendance/mark/', {
        session_id: selectedSession,
        attendance: attendanceMap,
      });
      setMsg(res.data.message);
      // Refresh roster data
      handleCourseChange(selectedCourse);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-calendar-check me-2"></i>Class Attendance Register</h3>
          <p className="text-muted small">Record daily roll-call attendance for scheduled course sessions</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Select Course</label>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code}) - {c.class_name}</option>
                ))}
              </select>
            </div>

            {rosterData && (
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Select Scheduled Session</label>
                <select
                  className="form-select"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <option value="">-- Choose Session Date --</option>
                  {rosterData.sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.date} ({s.start_time} - {s.end_time}) - {s.topic || 'Class Session'} {s.held ? ' [Already Marked]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="small text-muted mt-2">Loading students roster...</p>
        </div>
      )}

      {rosterData && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h6 className="mb-0 fw-bold">{rosterData.course.name} - Student Roster</h6>
              <span className="small text-muted">{rosterData.students.length} enrolled students</span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                onClick={() => handleMarkAll('PRESENT')}
              >
                Mark All Present
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleMarkAll('ABSENT')}
              >
                Mark All Absent
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Username</th>
                    <th>Section</th>
                    <th className="text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rosterData.students.length > 0 ? (
                    rosterData.students.map((st) => (
                      <tr key={st.enrollment_id}>
                        <td><span className="badge bg-primary">#{st.roll_no}</span></td>
                        <td className="fw-semibold">{st.name}</td>
                        <td className="small text-muted">{st.username}</td>
                        <td>{st.section}</td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <input
                              type="radio"
                              className="btn-check"
                              name={`att-${st.enrollment_id}`}
                              id={`p-${st.enrollment_id}`}
                              checked={attendanceMap[st.enrollment_id] === 'PRESENT'}
                              onChange={() => handleStatusChange(st.enrollment_id, 'PRESENT')}
                            />
                            <label className="btn btn-outline-success" htmlFor={`p-${st.enrollment_id}`}>
                              Present
                            </label>

                            <input
                              type="radio"
                              className="btn-check"
                              name={`att-${st.enrollment_id}`}
                              id={`l-${st.enrollment_id}`}
                              checked={attendanceMap[st.enrollment_id] === 'LATE'}
                              onChange={() => handleStatusChange(st.enrollment_id, 'LATE')}
                            />
                            <label className="btn btn-outline-warning" htmlFor={`l-${st.enrollment_id}`}>
                              Late
                            </label>

                            <input
                              type="radio"
                              className="btn-check"
                              name={`att-${st.enrollment_id}`}
                              id={`a-${st.enrollment_id}`}
                              checked={attendanceMap[st.enrollment_id] === 'ABSENT'}
                              onChange={() => handleStatusChange(st.enrollment_id, 'ABSENT')}
                            />
                            <label className="btn btn-outline-danger" htmlFor={`a-${st.enrollment_id}`}>
                              Absent
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No active students enrolled in this course.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer bg-white py-3 border-0 text-end">
              <button
                type="submit"
                className="btn btn-primary px-4 fw-semibold"
                disabled={submitting || !selectedSession}
              >
                {submitting ? 'Submitting Roll Call...' : 'Save Attendance Record'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
