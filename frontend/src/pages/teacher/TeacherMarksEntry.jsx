import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function TeacherMarksEntry() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examData, setExamData] = useState(null);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/results/exams/')
      .then((res) => setExams(res.data))
      .catch((e) => console.error(e));
  }, []);

  const handleExamChange = async (examId) => {
    setSelectedExam(examId);
    setExamData(null);
    setMarksMap({});
    setMsg(''); setErr('');

    if (!examId) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/results/exams/${examId}/marks/`);
      setExamData(res.data);
      const initialMap = {};
      res.data.students.forEach((st) => {
        initialMap[st.enrollment_id] = st.result ? st.result.marks_obtained : '';
      });
      setMarksMap(initialMap);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to load exam marks roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (enrollmentId, val) => {
    setMarksMap((prev) => ({
      ...prev,
      [enrollmentId]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    setSubmitting(true);
    setMsg(''); setErr('');

    const marksArray = Object.keys(marksMap)
      .filter((k) => marksMap[k] !== '' && marksMap[k] !== null)
      .map((k) => ({
        enrollment_id: Number(k),
        marks_obtained: Number(marksMap[k]),
      }));

    try {
      const res = await api.post(`/api/results/exams/${selectedExam}/marks/`, {
        marks: marksArray,
      });
      setMsg(res.data.message);
      handleExamChange(selectedExam);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to submit marks.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-pencil-square me-2"></i>Examination Marks Entry</h3>
          <p className="text-muted small">Input student scores for scheduled assessments to submit into the admin approval queue</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <label className="form-label small fw-semibold">Select Exam</label>
          <select
            className="form-select"
            value={selectedExam}
            onChange={(e) => handleExamChange(e.target.value)}
          >
            <option value="">-- Choose Exam Assessment --</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.course_name}) - Date: {ex.date} [Total Marks: {ex.total_marks}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="small text-muted mt-2">Loading students roster for exam...</p>
        </div>
      )}

      {examData && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-bold">{examData.exam.title} - {examData.exam.course_name}</h6>
              <span className="small text-muted">Total Marks: {examData.exam.total_marks} | Total Students: {examData.students.length}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Username</th>
                    <th>Section</th>
                    <th style={{ width: '180px' }}>Marks Obtained</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {examData.students.map((st) => (
                    <tr key={st.enrollment_id}>
                      <td><span className="badge bg-primary">#{st.roll_no}</span></td>
                      <td className="fw-semibold">{st.name}</td>
                      <td className="small text-muted">{st.username}</td>
                      <td>{st.section}</td>
                      <td>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={examData.exam.total_marks}
                            className="form-control"
                            placeholder="Score"
                            value={marksMap[st.enrollment_id] || ''}
                            onChange={(e) => handleMarksChange(st.enrollment_id, e.target.value)}
                          />
                          <span className="input-group-text bg-light">/ {examData.exam.total_marks}</span>
                        </div>
                      </td>
                      <td>
                        {st.result ? (
                          <div>
                            <span className={`badge ${
                              st.result.status === 'APPROVED' ? 'bg-success' : st.result.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                            }`}>
                              {st.result.status}
                            </span>
                            {st.result.rejection_reason && (
                              <div className="small text-danger mt-1">Reason: {st.result.rejection_reason}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">Not submitted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-footer bg-white py-3 border-0 text-end">
              <button
                type="submit"
                className="btn btn-primary px-4 fw-semibold"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Marks for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
