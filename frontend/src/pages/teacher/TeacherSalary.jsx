import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function TeacherSalary() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/finance/my-salary/?year=${year}&month=${month}`)
      .then((res) => setSalaryData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [year, month]);

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-wallet2 me-2"></i>My Salary Statement</h3>
          <p className="text-muted small">Real-time remuneration based on actual conducted class sessions</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>Month {m + 1}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-4">
          <div className="card shadow-sm border-0 border-start border-info border-4 rounded-3">
            <div className="card-body">
              <div className="small text-muted fw-semibold text-uppercase">Total Classes Conducted</div>
              <h2 className="fw-bold text-info mb-0">{salaryData?.total_sessions || 0} sessions</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card shadow-sm border-0 border-start border-success border-4 rounded-3">
            <div className="card-body">
              <div className="small text-muted fw-semibold text-uppercase">Total Accrued Earnings</div>
              <h2 className="fw-bold text-success mb-0">৳{Number(salaryData?.total_salary || 0).toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-bold">Conducted Sessions Breakdown</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Section</th>
                <th>Topic / Lecture</th>
                <th className="text-end">Remuneration Rate</th>
              </tr>
            </thead>
            <tbody>
              {salaryData?.breakdown && salaryData.breakdown.length > 0 ? (
                salaryData.breakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td className="small text-muted">{item.date}</td>
                    <td className="fw-semibold">{item.course_name}</td>
                    <td>{item.section_name}</td>
                    <td>{item.topic}</td>
                    <td className="text-end fw-bold text-success">৳{item.rate.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">No completed sessions recorded for this month.</td>
                </tr>
              )}
            </tbody>
            {salaryData?.breakdown && salaryData.breakdown.length > 0 && (
              <tfoot className="table-light">
                <tr>
                  <th colSpan="4" className="text-end">Total Earnings:</th>
                  <th className="text-end text-success fs-5">৳{Number(salaryData?.total_salary || 0).toLocaleString()}</th>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
