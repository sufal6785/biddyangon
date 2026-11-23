import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminPeople() {
  const [tab, setTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Forms
  const [newTeacher, setNewTeacher] = useState({ username: '', first_name: '', last_name: '', email: '', phone: '', designation: 'Senior Instructor', qualification: 'B.Sc' });
  const [newStudent, setNewStudent] = useState({ section: '', roll_no: '', first_name: '', last_name: '', phone: '', guardian_name: '', guardian_phone: '' });
  const [newAssign, setNewAssign] = useState({ teacher: '', course: '', rate_per_session: 1200 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes, aRes, cRes, crsRes] = await Promise.all([
        api.get('/api/people/teachers/'),
        api.get('/api/people/students/'),
        api.get('/api/people/assignments/'),
        api.get('/api/academics/classes/'),
        api.get('/api/academics/courses/'),
      ]);
      setTeachers(tRes.data);
      setStudents(sRes.data);
      setAssignments(aRes.data);
      setClasses(cRes.data);
      setCourses(crsRes.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load people data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await api.post(`/api/people/users/${userId}/status/`);
      fetchData();
    } catch (e) {
      setErr('Failed to toggle status.');
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/people/teachers/', newTeacher);
      setMsg(`Teacher ${newTeacher.username} created! Default password: teacher123`);
      setNewTeacher({ username: '', first_name: '', last_name: '', email: '', phone: '', designation: 'Senior Instructor', qualification: 'B.Sc' });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create teacher.');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/people/students/', newStudent);
      setMsg(`Student enrolled! Username generated: ${res.data.username} (Password: student123)`);
      setNewStudent({ section: '', roll_no: '', first_name: '', last_name: '', phone: '', guardian_name: '', guardian_phone: '' });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to register student.');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/people/assignments/', newAssign);
      setMsg('Teacher assigned to course with rate successfully!');
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to assign teacher.');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Remove this teacher assignment?')) return;
    try {
      await api.delete(`/api/people/assignments/${id}/`);
      fetchData();
    } catch (e) {
      setErr('Failed to remove assignment.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-people me-2"></i>People Management</h3>
          <p className="text-muted small">Manage faculty instructors, students, roll-number accounts, and teacher remuneration rates</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'teachers' ? 'active' : ''}`} onClick={() => setTab('teachers')}>
            <i className="bi bi-person-video3 me-1"></i> Faculty Teachers ({teachers.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
            <i className="bi bi-backpack me-1"></i> Students Directory ({students.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'assignments' ? 'active' : ''}`} onClick={() => setTab('assignments')}>
            <i className="bi bi-person-lines-fill me-1"></i> Remuneration & Assignments
          </button>
        </li>
      </ul>

      {/* Tab 1: Teachers */}
      {tab === 'teachers' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Register New Teacher</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateTeacher}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. teacher2"
                      value={newTeacher.username}
                      onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">First Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newTeacher.first_name}
                        onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Last Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newTeacher.last_name}
                        onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Designation</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newTeacher.designation}
                      onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Qualification</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newTeacher.qualification}
                      onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100">Add Teacher Account</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Faculty Members</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Instructor</th>
                      <th>Username</th>
                      <th>Designation</th>
                      <th>Courses Assigned</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => (
                      <tr key={t.id}>
                        <td className="fw-semibold">{t.first_name} {t.last_name}</td>
                        <td className="small text-muted">{t.username}</td>
                        <td>{t.designation}</td>
                        <td><span className="badge bg-info text-white">{t.assignments_count} courses</span></td>
                        <td>
                          <span className={`badge ${t.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {t.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${t.is_active ? 'btn-outline-danger' : 'btn-outline-success'} py-0`}
                            onClick={() => handleToggleStatus(t.id)}
                          >
                            {t.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students */}
      {tab === 'students' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Register Student</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateStudent}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Class Section</label>
                    <select
                      className="form-select form-select-sm"
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Section --</option>
                      {classes.flatMap((c) => c.sections.map((s) => ({ ...s, className: c.name, code: c.code }))).map((s) => (
                        <option key={s.id} value={s.id}>{s.className} - {s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Roll Number (Integer)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="e.g. 1"
                      value={newStudent.roll_no}
                      onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                      required
                    />
                    <div className="form-text small">Username auto-generates as [ClassCode]-[RollNo]</div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">First Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Last Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Student Phone</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Guardian Name & Phone</label>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-1"
                      placeholder="Guardian name"
                      value={newStudent.guardian_name}
                      onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Guardian phone"
                      value={newStudent.guardian_phone}
                      onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-success btn-sm w-100">Enroll Student</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Enrolled Students</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Roll</th>
                      <th>Student Name</th>
                      <th>Username</th>
                      <th>Section</th>
                      <th>Guardian Phone</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td><span className="badge bg-primary">#{s.roll_no}</span></td>
                        <td className="fw-semibold">{s.first_name} {s.last_name}</td>
                        <td className="small text-muted">{s.username}</td>
                        <td>{s.section_name}</td>
                        <td className="small">{s.guardian_phone || '-'}</td>
                        <td>
                          <span className={`badge ${s.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${s.is_active ? 'btn-outline-danger' : 'btn-outline-success'} py-0`}
                            onClick={() => handleToggleStatus(s.id)}
                          >
                            {s.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Remuneration & Assignments */}
      {tab === 'assignments' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Assign Teacher to Course</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateAssignment}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Teacher</label>
                    <select
                      className="form-select form-select-sm"
                      value={newAssign.teacher}
                      onChange={(e) => setNewAssign({ ...newAssign, teacher: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Teacher --</option>
                      {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name || t.username} ({t.designation})</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course</label>
                    <select
                      className="form-select form-select-sm"
                      value={newAssign.course}
                      onChange={(e) => setNewAssign({ ...newAssign, course: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Rate per Session Held (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={newAssign.rate_per_session}
                      onChange={(e) => setNewAssign({ ...newAssign, rate_per_session: e.target.value })}
                      required
                    />
                    <div className="form-text small">Used for dynamic monthly payroll calculation per session held.</div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100">Set Assignment & Rate</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Teacher Remuneration Rates</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Teacher</th>
                      <th>Course</th>
                      <th>Rate / Session</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td className="fw-semibold">{a.teacher_name}</td>
                        <td>{a.course_name} ({a.course_code})</td>
                        <td className="fw-bold text-success">৳{a.rate_per_session.toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm py-0"
                            onClick={() => handleDeleteAssignment(a.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
