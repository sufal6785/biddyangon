import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminAcademics() {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Class & Section Form
  const [newClass, setNewClass] = useState({ name: '', code: '' });
  const [newSection, setNewSection] = useState({ academic_class: '', name: '' });

  // Course Form
  const [newCourse, setNewCourse] = useState({ academic_class: '', name: '', code: '', default_fee: '', total_sessions_planned: 30 });

  // Routine Slot Form
  const [newSlot, setNewSlot] = useState({ section: '', course: '', teacher: '', weekday: 0, start_time: '10:00', end_time: '11:30', room: 'Room 101' });

  // Session Generator Form
  const [sessionGen, setSessionGen] = useState({ course: '', start_date: '', end_date: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, crsRes, rtnRes, tchRes] = await Promise.all([
        api.get('/api/academics/classes/'),
        api.get('/api/academics/courses/'),
        api.get('/api/academics/routine/'),
        api.get('/api/people/teachers/'),
      ]);
      setClasses(clsRes.data);
      setCourses(crsRes.data);
      setRoutine(rtnRes.data);
      setTeachers(tchRes.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load academic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/academics/classes/', newClass);
      setMsg(`Class "${newClass.name}" created!`);
      setNewClass({ name: '', code: '' });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create class.');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/academics/sections/', newSection);
      setMsg(`Section created!`);
      setNewSection({ academic_class: '', name: '' });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create section.');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/academics/courses/', newCourse);
      setMsg(`Course "${newCourse.name}" created!`);
      setNewCourse({ academic_class: '', name: '', code: '', default_fee: '', total_sessions_planned: 30 });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create course.');
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/academics/routine/', newSlot);
      setMsg('Routine slot successfully added!');
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to add routine slot.');
    }
  };

  const handleGenerateSessions = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/academics/sessions/generate/', sessionGen);
      setMsg(res.data.message);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to generate sessions.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-book me-2"></i>Academics Setup</h3>
          <p className="text-muted small">Manage classes, sections, courses, routine slots, and session schedules</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
            <i className="bi bi-diagram-3 me-1"></i> Classes & Sections
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <i className="bi bi-journal-bookmark me-1"></i> Courses
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>
            <i className="bi bi-calendar3 me-1"></i> Routine Slots
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            <i className="bi bi-gear-wide-connected me-1"></i> Generate Sessions
          </button>
        </li>
      </ul>

      {/* Tab 1: Classes & Sections */}
      {activeTab === 'classes' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Create Academic Class</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateClass}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Class Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Class 10 (SSC 2026)"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Unique Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. SSC26"
                      value={newClass.code}
                      onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm px-3">Add Class</button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Add Section to Class</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateSection}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Class</label>
                    <select
                      className="form-select"
                      value={newSection.academic_class}
                      onChange={(e) => setNewSection({ ...newSection, academic_class: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Section Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Science-A or Morning"
                      value={newSection.name}
                      onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-info btn-sm text-white px-3">Add Section</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Existing Classes & Sections</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Class Name</th>
                      <th>Code</th>
                      <th>Sections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.name}</td>
                        <td><span className="badge bg-secondary">{c.code}</span></td>
                        <td>
                          {c.sections && c.sections.length > 0 ? (
                            c.sections.map((s) => (
                              <span key={s.id} className="badge bg-light text-dark border me-1">{s.name}</span>
                            ))
                          ) : (
                            <span className="text-muted small">No sections created</span>
                          )}
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

      {/* Tab 2: Courses */}
      {activeTab === 'courses' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Create New Course</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateCourse}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Class</label>
                    <select
                      className="form-select form-select-sm"
                      value={newCourse.academic_class}
                      onChange={(e) => setNewCourse({ ...newCourse, academic_class: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Course Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Higher Mathematics"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Course Code</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. MATH-10"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Default Fee (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      placeholder="e.g. 5000"
                      value={newCourse.default_fee}
                      onChange={(e) => setNewCourse({ ...newCourse, default_fee: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Planned Sessions</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={newCourse.total_sessions_planned}
                      onChange={(e) => setNewCourse({ ...newCourse, total_sessions_planned: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100">Add Course</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Active Courses</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Course</th>
                      <th>Class</th>
                      <th>Code</th>
                      <th>Fee</th>
                      <th>Planned Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.name}</td>
                        <td>{c.class_name}</td>
                        <td><span className="badge bg-secondary">{c.code}</span></td>
                        <td className="fw-bold text-success">৳{c.default_fee.toLocaleString()}</td>
                        <td>{c.total_sessions_planned} classes</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Routine Slots */}
      {activeTab === 'routine' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Add Routine Slot</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateSlot}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Course</label>
                    <select
                      className="form-select form-select-sm"
                      value={newSlot.course}
                      onChange={(e) => setNewSlot({ ...newSlot, course: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.class_name})</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Section</label>
                    <select
                      className="form-select form-select-sm"
                      value={newSlot.section}
                      onChange={(e) => setNewSlot({ ...newSlot, section: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Section --</option>
                      {classes.flatMap((c) => c.sections.map((s) => ({ ...s, className: c.name }))).map((s) => (
                        <option key={s.id} value={s.id}>{s.className} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Teacher</label>
                    <select
                      className="form-select form-select-sm"
                      value={newSlot.teacher}
                      onChange={(e) => setNewSlot({ ...newSlot, teacher: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Teacher --</option>
                      {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name || t.username} ({t.designation})</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Weekday</label>
                    <select
                      className="form-select form-select-sm"
                      value={newSlot.weekday}
                      onChange={(e) => setNewSlot({ ...newSlot, weekday: Number(e.target.value) })}
                    >
                      <option value={5}>Saturday</option>
                      <option value={6}>Sunday</option>
                      <option value={0}>Monday</option>
                      <option value={1}>Tuesday</option>
                      <option value={2}>Wednesday</option>
                      <option value={3}>Thursday</option>
                      <option value={4}>Friday</option>
                    </select>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={newSlot.start_time}
                        onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={newSlot.end_time}
                        onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Room</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newSlot.room}
                      onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100">Schedule Slot</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Weekly Routine Timetable</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Instructor</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routine.map((r) => (
                      <tr key={r.id}>
                        <td><span className="badge bg-secondary">{r.weekday_name}</span></td>
                        <td className="small fw-semibold">{r.start_time} - {r.end_time}</td>
                        <td className="fw-semibold">{r.course_name}</td>
                        <td>{r.section_name}</td>
                        <td>{r.teacher_name}</td>
                        <td><span className="badge bg-light text-dark border">{r.room}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Session Generator */}
      {activeTab === 'sessions' && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold"><i className="bi bi-calendar2-range me-2 text-primary"></i>Generate Sessions from Routine</h6>
              </div>
              <div className="card-body p-4">
                <p className="text-muted small">
                  Instantly projects all upcoming class sessions and attendance rosters for a course across a date range according to the weekly routine slots configured above.
                </p>
                <form onSubmit={handleGenerateSessions}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Course</label>
                    <select
                      className="form-select"
                      value={sessionGen.course}
                      onChange={(e) => setSessionGen({ ...sessionGen, course: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={sessionGen.start_date}
                        onChange={(e) => setSessionGen({ ...sessionGen, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={sessionGen.end_date}
                        onChange={(e) => setSessionGen({ ...sessionGen, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                    <i className="bi bi-magic me-2"></i>Generate Scheduled Sessions
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
