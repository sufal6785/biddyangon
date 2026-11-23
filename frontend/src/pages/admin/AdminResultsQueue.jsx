import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminResultsQueue() {
  const [tab, setTab] = useState('results');
  const [pendingResults, setPendingResults] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Reject Modal
  const [rejectItem, setRejectItem] = useState(null); // { type: 'result'|'question', id }
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRes, qRes] = await Promise.all([
        api.get('/api/results/approvals/'),
        api.get('/api/exams/questions/?status=PENDING'),
      ]);
      setPendingResults(resRes.data);
      setPendingQuestions(qRes.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveResult = async (id) => {
    setMsg(''); setErr('');
    try {
      const res = await api.post(`/api/results/approvals/${id}/approve/`);
      setMsg(res.data.message);
      fetchData();
    } catch (e) {
      setErr('Failed to approve result.');
    }
  };

  const handleApproveQuestion = async (id) => {
    setMsg(''); setErr('');
    try {
      const res = await api.post(`/api/exams/questions/${id}/approve/`);
      setMsg(res.data.message);
      fetchData();
    } catch (e) {
      setErr('Failed to approve question.');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectItem || !rejectReason.trim()) return;
    try {
      if (rejectItem.type === 'result') {
        const res = await api.post(`/api/results/approvals/${rejectItem.id}/reject/`, { reason: rejectReason });
        setMsg(res.data.message);
      } else {
        const res = await api.post(`/api/exams/questions/${rejectItem.id}/reject/`, { reason: rejectReason });
        setMsg(res.data.message);
      }
      setRejectItem(null);
      setRejectReason('');
      fetchData();
    } catch (e) {
      setErr('Failed to reject submission.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-shield-check me-2"></i>Approvals & Quality Queue</h3>
          <p className="text-muted small">Verify and approve teacher-submitted student examination marks and question bank items</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'results' ? 'active' : ''}`} onClick={() => setTab('results')}>
            <i className="bi bi-award me-1"></i> Pending Exam Marks ({pendingResults.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'questions' ? 'active' : ''}`} onClick={() => setTab('questions')}>
            <i className="bi bi-question-circle me-1"></i> Pending Question Bank Items ({pendingQuestions.length})
          </button>
        </li>
      </ul>

      {tab === 'results' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0 fw-bold">Teacher-Submitted Exam Results Awaiting Verification</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Exam Title</th>
                  <th>Course</th>
                  <th>Student</th>
                  <th>Marks Entered</th>
                  <th>Submitted By</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingResults.length > 0 ? (
                  pendingResults.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.exam_title}</td>
                      <td>{r.course_name}</td>
                      <td>
                        <span className="fw-semibold">{r.student_name}</span>
                        <div className="small text-muted">{r.student_username}</div>
                      </td>
                      <td>
                        <span className="fw-bold fs-6 text-primary">{r.marks_obtained}</span> / {r.total_marks}
                      </td>
                      <td>{r.submitted_by}</td>
                      <td className="small text-muted">{r.submitted_at}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm py-0"
                            onClick={() => handleApproveResult(r.id)}
                          >
                            <i className="bi bi-check-lg me-1"></i> Approve
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm py-0"
                            onClick={() => setRejectItem({ type: 'result', id: r.id })}
                          >
                            <i className="bi bi-x-lg me-1"></i> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      <i className="bi bi-check2-all text-success fs-3 d-block mb-2"></i>
                      All teacher-submitted results have been verified and processed!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0 fw-bold">Teacher-Submitted Question Bank Items Awaiting Approval</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Course</th>
                  <th>Question & Options</th>
                  <th>Correct Answer</th>
                  <th>Marks</th>
                  <th>Submitted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingQuestions.length > 0 ? (
                  pendingQuestions.map((q) => (
                    <tr key={q.id}>
                      <td className="fw-semibold">{q.course_name}</td>
                      <td>
                        <div className="fw-semibold mb-1">{q.text}</div>
                        <div className="small text-muted">
                          <span className="me-2">A: {q.option_a}</span>
                          <span className="me-2">B: {q.option_b}</span>
                          <span className="me-2">C: {q.option_c}</span>
                          <span>D: {q.option_d}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success">Option {q.correct_option}</span>
                      </td>
                      <td>{q.marks}</td>
                      <td>{q.submitted_by}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm py-0"
                            onClick={() => handleApproveQuestion(q.id)}
                          >
                            <i className="bi bi-check-lg me-1"></i> Approve
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm py-0"
                            onClick={() => setRejectItem({ type: 'question', id: q.id })}
                          >
                            <i className="bi bi-x-lg me-1"></i> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <i className="bi bi-check2-all text-success fs-3 d-block mb-2"></i>
                      No questions pending quality review!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectItem && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <form onSubmit={handleConfirmReject}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold text-danger">
                    <i className="bi bi-exclamation-octagon me-2"></i>Reject Submission
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setRejectItem(null)}></button>
                </div>
                <div className="modal-body">
                  <p className="small text-muted">Please provide a reason or correction instruction for the teacher.</p>
                  <label className="form-label small fw-semibold">Rejection Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Total marks mismatch or ambiguous question phrasing..."
                    required
                  ></textarea>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRejectItem(null)}>Cancel</button>
                  <button type="submit" className="btn btn-danger btn-sm">Confirm Rejection</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
