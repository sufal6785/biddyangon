import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function TeacherQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    course: '',
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1.0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, cRes] = await Promise.all([
        api.get('/api/exams/questions/'),
        api.get('/api/academics/courses/'),
      ]);
      setQuestions(qRes.data);
      setCourses(cRes.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/exams/questions/', form);
      setMsg(`Question submitted successfully! Status: ${res.data.status}`);
      setForm({
        course: '',
        text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        marks: 1.0,
      });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to submit question.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-patch-question me-2"></i>Question Bank Authoring</h3>
          <p className="text-muted small">Create and submit multiple-choice assessment questions for academic approval</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold">Author New MCQ Question</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Course</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">Question Text</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="Enter question statement or problem..."
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Option A</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.option_a}
                      onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Option B</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.option_b}
                      onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Option C</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.option_c}
                      onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Option D</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.option_d}
                      onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Correct Option</label>
                    <select
                      className="form-select form-select-sm"
                      value={form.correct_option}
                      onChange={(e) => setForm({ ...form, correct_option: e.target.value })}
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control form-control-sm"
                      value={form.marks}
                      onChange={(e) => setForm({ ...form, marks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold">
                  Submit Question
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Question Bank Items</h6>
              <span className="badge bg-light text-dark border">{questions.length} questions</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Course</th>
                    <th>Question & Options</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id}>
                      <td className="fw-semibold">{q.course_name}</td>
                      <td>
                        <div className="fw-semibold mb-1">{q.text}</div>
                        <div className="small text-muted mb-1">
                          A: {q.option_a} | B: {q.option_b} | C: {q.option_c} | D: {q.option_d}
                        </div>
                        <div className="small">
                          <span className="text-success fw-semibold me-2">Correct: {q.correct_option}</span>
                          <span className="text-muted">({q.marks} marks)</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          q.status === 'APPROVED' ? 'bg-success' : q.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                        }`}>
                          {q.status}
                        </span>
                        {q.rejection_reason && (
                          <div className="small text-danger mt-1">Note: {q.rejection_reason}</div>
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
    </div>
  );
}
