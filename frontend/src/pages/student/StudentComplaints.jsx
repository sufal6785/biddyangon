import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/complaints/');
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/complaints/', { subject, body });
      setMsg(res.data.message);
      setSubject('');
      setBody('');
      fetchComplaints();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-envelope-paper me-2"></i>Student Grievances & Feedback</h3>
          <p className="text-muted small">Submit concerns, facilities feedback, or academic questions directly to administration</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold">Submit New Grievance / Feedback</h6>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Subject</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Schedule clash between Math and Physics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Detailed Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="5"
                    placeholder="Explain the problem in detail so the administration can investigate..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Send Grievance Ticket'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold">My Submitted Grievances</h6>
            </div>
            <div className="card-body p-0">
              {complaints.length > 0 ? (
                <div className="list-group list-group-flush rounded-4">
                  {complaints.map((c) => (
                    <div key={c.id} className="list-group-item p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">#{c.id}: {c.subject}</h6>
                        <span className={`badge ${
                          c.status === 'RESOLVED' ? 'bg-success' : c.status === 'IN_PROGRESS' ? 'bg-info text-white' : 'bg-warning text-dark'
                        }`}>
                          {c.status_display}
                        </span>
                      </div>
                      <p className="text-muted small mb-2">{c.body}</p>
                      <div className="small text-muted mb-2">Submitted on: {c.created_at}</div>

                      {c.admin_response ? (
                        <div className="p-3 bg-light border-start border-primary border-4 rounded-3 small">
                          <strong className="text-primary d-block mb-1">
                            <i className="bi bi-shield-check me-1"></i>Official Admin Response:
                          </strong>
                          <span>{c.admin_response}</span>
                        </div>
                      ) : (
                        <div className="small text-muted fst-italic">
                          Awaiting administration review.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-chat-square-text fs-1 d-block mb-2 text-muted"></i>
                  You haven't submitted any grievances.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
