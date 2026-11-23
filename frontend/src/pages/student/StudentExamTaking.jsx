import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';

export default function StudentExamTaking() {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();

  // Mode: taking or review
  const isReviewMode = Boolean(attemptId);

  const [examData, setExamData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gateBlocked, setGateBlocked] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true);
    setGateBlocked(null);
    setErr('');

    if (isReviewMode) {
      api.get(`/api/exams/attempts/${attemptId}/`)
        .then((res) => setReviewData(res.data))
        .catch((e) => setErr('Failed to load review sheet.'))
        .finally(() => setLoading(false));
    } else {
      api.get(`/api/exams/take/${examId}/`)
        .then((res) => {
          setExamData(res.data);
          const initial = {};
          res.data.questions.forEach((q) => {
            initial[q.id] = '';
          });
          setAnswers(initial);
        })
        .catch((e) => {
          if (e.response && e.response.status === 403) {
            setGateBlocked(e.response.data);
          } else {
            setErr(e.response?.data?.error || 'Failed to start exam.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [examId, attemptId]);

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to finalize and submit your exam?')) return;
    setSubmitting(true);
    setErr('');
    try {
      const res = await api.post(`/api/exams/submit/${examId}/`, {
        answers: answers,
      });
      setSubmissionResult(res.data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Checking server-side fee clearance & loading questions...</p>
      </div>
    );
  }

  // Strict Server-Side Fee Gate Blocked View
  if (gateBlocked) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 text-center p-5">
              <div className="text-danger mb-3">
                <i className="bi bi-shield-lock-fill" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="fw-bold text-danger">Exam Fee Gate: Access Denied</h4>
              <p className="text-muted mt-2">
                {gateBlocked.error}
              </p>
              {gateBlocked.due_amount && (
                <div className="alert alert-warning py-2 my-3">
                  Outstanding Balance Required: <strong>৳{gateBlocked.due_amount.toLocaleString()}</strong>
                </div>
              )}
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Link to="/student/fees" className="btn btn-outline-primary">
                  <i className="bi bi-credit-card me-1"></i> Review Fees & Due
                </Link>
                <Link to="/student/exams" className="btn btn-secondary">
                  Back to Exams
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed Submission View
  if (submissionResult) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 text-center p-5">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="fw-bold">Exam Completed & Auto-Scored!</h3>
              <p className="text-muted">Your assessment answers have been graded and recorded.</p>
              <div className="p-4 bg-light rounded-4 my-3">
                <div className="text-muted small text-uppercase fw-semibold">Your Score</div>
                <h1 className="fw-bold text-primary mb-0">
                  {submissionResult.score} <span className="fs-4 text-muted">/ {submissionResult.total_marks}</span>
                </h1>
              </div>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Link to={`/student/exams/attempt/${submissionResult.attempt_id}`} className="btn btn-primary">
                  <i className="bi bi-file-earmark-text me-1"></i> Review Questions & Answers
                </Link>
                <Link to="/student/exams" className="btn btn-outline-secondary">
                  Return to Exams
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Mode
  if (isReviewMode && reviewData) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0"><i className="bi bi-file-earmark-check me-2"></i>Exam Attempt Review</h3>
            <p className="text-muted small">{reviewData.exam_title} | Student: {reviewData.student_username}</p>
          </div>
          <div className="text-end">
            <h4 className="fw-bold text-primary mb-0">{reviewData.score} / {reviewData.total_marks}</h4>
            <span className="small text-muted">Final Score</span>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {reviewData.answers.map((ans, idx) => (
            <div key={idx} className={`card shadow-sm border-0 border-start ${ans.is_correct ? 'border-success' : 'border-danger'} border-4 rounded-4`}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0">Question {idx + 1}: {ans.text}</h6>
                  <span className={`badge ${ans.is_correct ? 'bg-success' : 'bg-danger'}`}>
                    {ans.is_correct ? `+${ans.marks} Marks` : '0 Marks'}
                  </span>
                </div>

                <div className="row g-2 mt-2">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optKey = `option_${opt.toLowerCase()}`;
                    const isSelected = ans.selected_option === opt;
                    const isCorrect = ans.correct_option === opt;

                    let bgClass = 'bg-light text-dark';
                    if (isCorrect) bgClass = 'bg-success text-white fw-bold';
                    else if (isSelected && !isCorrect) bgClass = 'bg-danger text-white';

                    return (
                      <div key={opt} className="col-md-6">
                        <div className={`p-2 rounded-3 small ${bgClass} border`}>
                          <span className="me-2 fw-semibold">[{opt}]</span> {ans[optKey]}
                          {isSelected && <span className="ms-2 badge bg-dark">Your Choice</span>}
                          {isCorrect && <span className="ms-2 badge bg-light text-success">Correct</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/student/exams" className="btn btn-secondary px-4">Back to Exams</Link>
        </div>
      </div>
    );
  }

  // Active Exam Taking Mode
  return (
    <div className="container py-4">
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      {examData && (
        <form onSubmit={handleSubmit}>
          {/* Header Card */}
          <div className="card shadow-sm border-0 rounded-4 mb-4 bg-primary text-white p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <span className="badge bg-light text-primary mb-2">Live Fee-Gated Online Exam</span>
                <h3 className="fw-bold mb-1">{examData.exam.title}</h3>
                <p className="mb-0 opacity-75">{examData.exam.course_name} | {examData.questions.length} Questions</p>
              </div>
              <div className="text-end">
                <div className="fs-5 fw-bold"><i className="bi bi-clock me-1"></i> {examData.exam.duration_minutes} Mins</div>
                <div className="small opacity-75">Total Marks: {examData.exam.total_marks}</div>
              </div>
            </div>
          </div>

          {/* Question Items */}
          <div className="d-flex flex-column gap-3 mb-4">
            {examData.questions.map((q, idx) => (
              <div key={q.id} className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="fw-bold mb-0">Question {idx + 1} of {examData.questions.length}</h6>
                    <span className="badge bg-secondary">{q.marks} Mark(s)</span>
                  </div>
                  <p className="fs-6 fw-semibold text-dark mb-3">{q.text}</p>

                  <div className="row g-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optKey = `option_${opt.toLowerCase()}`;
                      const isSelected = answers[q.id] === opt;
                      return (
                        <div key={opt} className="col-md-6">
                          <label
                            className={`d-block p-3 rounded-3 border cursor-pointer transition ${
                              isSelected ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'bg-light text-dark'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              className="form-check-input me-2"
                              checked={isSelected}
                              onChange={() => handleSelectOption(q.id, opt)}
                            />
                            <span className="me-2 fw-semibold">[{opt}]</span> {q[optKey]}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
            <p className="text-muted small mb-3">
              Ensure you have answered all questions. Once submitted, your exam will be automatically evaluated by the server.
            </p>
            <button
              type="submit"
              className="btn btn-success btn-lg px-5 fw-bold shadow-sm mx-auto"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Evaluating & Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send-check me-2"></i> Submit & Finish Exam
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
