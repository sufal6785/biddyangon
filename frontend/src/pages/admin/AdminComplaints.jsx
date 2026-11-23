import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseForm, setResponseForm] = useState({ status: 'RESOLVED', admin_response: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/complaints/');
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenDetail = (c) => {
    setSelectedComplaint(c);
    setResponseForm({
      status: c.status === 'OPEN' ? 'RESOLVED' : c.status,
      admin_response: c.admin_response || '',
    });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await api.post(`/api/complaints/${selectedComplaint.id}/resolve/`, responseForm);
      setMsg(res.data.message);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (e) {
      setErr('Failed to update complaint status.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-chat-left-dots me-2"></i>Student Complaints & Grievances</h3>
          <p className="text-muted small">Review, track, and provide official administration responses to student concerns</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">All Student Feedback & Grievances</h6>
          <span className="badge bg-light text-dark border">{complaints.length} tickets</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Ticket</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c.id}>
                    <td><span className="badge bg-secondary">#{c.id}</span></td>
                    <td>
                      <div className="fw-semibold">{c.student_name}</div>
                      <div className="small text-muted">{c.student_username}</div>
                    </td>
                    <td className="fw-semibold">{c.subject}</td>
                    <td className="small text-muted">{c.created_at}</td>
                    <td>
                      <span className={`badge ${
                        c.status === 'RESOLVED' ? 'bg-success' : c.status === 'IN_PROGRESS' ? 'bg-info text-white' : 'bg-warning text-dark'
                      }`}>
                        {c.status_display}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm py-0"
                        onClick={() => handleOpenDetail(c)}
                      >
                        <i className="bi bi-pencil-square me-1"></i> Address
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No student grievances submitted.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <form onSubmit={handleResolveSubmit}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    Complaint #{selectedComplaint.id}: {selectedComplaint.subject}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedComplaint(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="small text-muted mb-1">
                      Submitted by: <strong>{selectedComplaint.student_name} ({selectedComplaint.student_username})</strong>
                    </div>
                    <div className="small text-muted mb-2">Date: {selectedComplaint.created_at}</div>
                    <div className="small fw-semibold text-dark">{selectedComplaint.body}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Update Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={responseForm.status}
                      onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Official Admin Response</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={responseForm.admin_response}
                      onChange={(e) => setResponseForm({ ...responseForm, admin_response: e.target.value })}
                      placeholder="Write resolution notes visible to the student..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedComplaint(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Resolution</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
