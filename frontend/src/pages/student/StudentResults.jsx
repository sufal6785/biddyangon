import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/results/my-results/')
      .then((res) => setResults(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-trophy me-2"></i>My Examination Results</h3>
          <p className="text-muted small">Officially approved and published academic scores</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-bold">Published Performance Record</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Exam Title</th>
                <th>Course</th>
                <th>Exam Date</th>
                <th>Marks Obtained</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.exam_title}</td>
                    <td>
                      <span>{r.course_name}</span>
                      <span className="badge bg-secondary ms-2">{r.course_code}</span>
                    </td>
                    <td className="small text-muted">{r.exam_date}</td>
                    <td>
                      <span className="fw-bold fs-6 text-primary">{r.marks_obtained}</span> / {r.total_marks}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div
                            className={`progress-bar ${r.percentage >= 80 ? 'bg-success' : r.percentage >= 50 ? 'bg-primary' : 'bg-danger'}`}
                            role="progressbar"
                            style={{ width: `${Math.min(r.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="small fw-semibold">{r.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Approved</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No published exam results found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
