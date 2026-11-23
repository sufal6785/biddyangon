import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/exams/student-exams/')
      .then((res) => setExams(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Checking assessment eligibility and fee gate...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-laptop me-2"></i>Online Assessments & Exams</h3>
          <p className="text-muted small">Computer-based assessments with strict server-side fee-gate verification</p>
        </div>
      </div>

      <div className="row g-4">
        {exams.length > 0 ? (
          exams.map((ex) => (
            <div key={ex.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0">{ex.title}</h5>
                    <span className="badge bg-secondary">{ex.course_code}</span>
                  </div>
                  <p className="text-muted small mb-3">{ex.course_name}</p>

                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Date:</span>
                      <strong>{ex.date}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Duration:</span>
                      <strong>{ex.duration_minutes} Minutes</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total Marks:</span>
                      <strong>{ex.total_marks} Marks</strong>
                    </div>
                  </div>

                  {/* Fee Gate Evaluation */}
                  <div className="mb-4">
                    {ex.is_cleared ? (
                      <div className="alert alert-success py-2 mb-0 small text-center">
                        <i className="bi bi-shield-check me-1"></i> <strong>Tuition Cleared:</strong> Eligible for Exam
                      </div>
                    ) : (
                      <div className="alert alert-danger py-2 mb-0 small text-center">
                        <i className="bi bi-lock-fill me-1"></i> <strong>Fee Due (৳{ex.due_amount}):</strong> Exam Locked
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    {ex.attempt && ex.attempt.is_completed ? (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-muted">Completed Score:</span>
                          <span className="fw-bold text-success fs-5">{ex.attempt.score} / {ex.total_marks}</span>
                        </div>
                        <Link to={`/student/exams/attempt/${ex.attempt.id}`} className="btn btn-outline-primary btn-sm w-100">
                          <i className="bi bi-file-earmark-text me-1"></i> Review Answer Sheet
                        </Link>
                      </div>
                    ) : ex.is_cleared ? (
                      <Link to={`/student/exams/take/${ex.id}`} className="btn btn-primary btn-sm w-100 fw-semibold">
                        <i className="bi bi-play-circle me-1"></i> Start Exam Assessment
                      </Link>
                    ) : (
                      <button className="btn btn-secondary btn-sm w-100" disabled>
                        <i className="bi bi-lock me-1"></i> Locked (Clear ৳{ex.due_amount} due)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-4 text-center py-5">
              <i className="bi bi-journal-x text-muted fs-1 mb-2"></i>
              <h5 className="text-muted">No exams currently scheduled for your enrolled courses.</h5>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
