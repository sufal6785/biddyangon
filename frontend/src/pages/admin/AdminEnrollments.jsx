import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Single Enroll Form
  const [singleForm, setSingleForm] = useState({ student: '', course: '', fee_total: '' });
  // Bulk Enroll Form
  const [bulkForm, setBulkForm] = useState({ section: '', course: '', fee_total: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, sRes, cRes, clsRes] = await Promise.all([
        api.get('/api/enrollments/'),
        api.get('/api/people/students/'),
        api.get('/api/academics/courses/'),
        api.get('/api/academics/classes/'),
      ]);
      setEnrollments(eRes.data);
      setStudents(sRes.data);
      setCourses(cRes.data);
      setClasses(clsRes.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSingleEnroll = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/enrollments/', singleForm);
      setMsg('Student successfully enrolled in course!');
      setSingleForm({ student: '', course: '', fee_total: '' });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to enroll student.');
    }
  };

  const handleBulkEnroll = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/enrollments/bulk/', bulkForm);
      setMsg(res.data.message);
      setBulkForm({ section: '', course: '', fee_total: '' });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to bulk enroll section.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.post(`/api/enrollments/${id}/status/`);
      fetchData();
    } catch (e) {
      setErr('Failed to toggle enrollment active status.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-person-check me-2"></i>Course Enrollments</h3>
          <p className="text-muted small">Manage student admissions, custom agreed course fees, and bulk section enrollment</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="row g-4 mb-4">
        {/* Single Enrollment */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-person-plus me-2 text-primary"></i>Single Student Enrollment</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSingleEnroll}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Select Student</label>
                  <select
                    className="form-select form-select-sm"
                    value={singleForm.student}
                    onChange={(e) => setSingleForm({ ...singleForm, student: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.username}) - {s.section_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Select Course</label>
                  <select
                    className="form-select form-select-sm"
                    value={singleForm.course}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const selectedCourse = courses.find((c) => String(c.id) === String(cid));
                      setSingleForm({
                        ...singleForm,
                        course: cid,
                        fee_total: selectedCourse ? selectedCourse.default_fee : '',
                      });
                    }}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - Standard Fee: ৳{c.default_fee}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Agreed Tuition Fee (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-sm"
                    value={singleForm.fee_total}
                    onChange={(e) => setSingleForm({ ...singleForm, fee_total: e.target.value })}
                    placeholder="Total fee for this course"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold">
                  Enroll Student
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bulk Section Enrollment */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-people-fill me-2 text-info"></i>Bulk Section Enrollment</h6>
            </div>
            <div className="card-body">
              <p className="text-muted small">
                Instantly enroll every active student in a class section into a chosen course with a standard or discounted fee.
              </p>
              <form onSubmit={handleBulkEnroll}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Target Section</label>
                  <select
                    className="form-select form-select-sm"
                    value={bulkForm.section}
                    onChange={(e) => setBulkForm({ ...bulkForm, section: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Section --</option>
                    {classes.flatMap((c) => c.sections.map((s) => ({ ...s, className: c.name }))).map((s) => (
                      <option key={s.id} value={s.id}>{s.className} - {s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Target Course</label>
                  <select
                    className="form-select form-select-sm"
                    value={bulkForm.course}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const selectedCourse = courses.find((c) => String(c.id) === String(cid));
                      setBulkForm({
                        ...bulkForm,
                        course: cid,
                        fee_total: selectedCourse ? selectedCourse.default_fee : '',
                      });
                    }}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - Standard Fee: ৳{c.default_fee}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Fee per Student (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-sm"
                    value={bulkForm.fee_total}
                    onChange={(e) => setBulkForm({ ...bulkForm, fee_total: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-info btn-sm text-white w-100 fw-semibold">
                  Bulk Enroll All Students
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments Ledger Table */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Active Enrollments & Payment Status</h6>
          <span className="badge bg-light text-dark border">{enrollments.length} records</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Student</th>
                <th>Section</th>
                <th>Course</th>
                <th>Agreed Fee</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Fee Status</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="fw-semibold">{e.student_name}</div>
                    <div className="small text-muted">{e.student_username}</div>
                  </td>
                  <td>{e.section_name}</td>
                  <td>
                    <span className="fw-semibold">{e.course_name}</span>
                    <div className="small text-muted">{e.course_code}</div>
                  </td>
                  <td className="fw-bold">৳{e.fee_total.toLocaleString()}</td>
                  <td className="text-success fw-bold">৳{e.total_paid.toLocaleString()}</td>
                  <td className={`fw-bold ${e.due_amount > 0 ? 'text-danger' : 'text-muted'}`}>
                    ৳{e.due_amount.toLocaleString()}
                  </td>
                  <td>
                    {e.is_cleared ? (
                      <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Cleared</span>
                    ) : (
                      <span className="badge bg-warning text-dark"><i className="bi bi-clock me-1"></i>Due</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${e.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {e.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${e.is_active ? 'btn-outline-danger' : 'btn-outline-success'} py-0`}
                      onClick={() => handleToggleStatus(e.id)}
                    >
                      {e.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
