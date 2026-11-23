import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminFinance() {
  const [tab, setTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [receiptDetail, setReceiptDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({ enrollment: '', amount: '', method: 'CASH', remarks: '', paid_on: new Date().toISOString().split('T')[0] });
  // Expense Form
  const [expenseForm, setExpenseForm] = useState({ category: 'UTILITIES', purpose: '', amount: '', spent_on: new Date().toISOString().split('T')[0] });
  // Payroll Date
  const today = new Date();
  const [payrollYear, setPayrollYear] = useState(today.getFullYear());
  const [payrollMonth, setPayrollMonth] = useState(today.getMonth() + 1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, enrRes, expRes, sumRes, prlRes] = await Promise.all([
        api.get('/api/finance/payments/'),
        api.get('/api/enrollments/'),
        api.get('/api/finance/expenditures/'),
        api.get('/api/finance/summary/'),
        api.get(`/api/finance/payroll/?year=${payrollYear}&month=${payrollMonth}`),
      ]);
      setPayments(payRes.data);
      setEnrollments(enrRes.data.filter((e) => e.is_active));
      setExpenses(expRes.data);
      setSummary(sumRes.data);
      setPayroll(prlRes.data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [payrollYear, payrollMonth]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api.post('/api/finance/payments/', paymentForm);
      setMsg(`Payment recorded successfully! Receipt #${res.data.receipt_no}. Remaining course due: ৳${res.data.remaining_due.toLocaleString()}`);
      setPaymentForm({ enrollment: '', amount: '', method: 'CASH', remarks: '', paid_on: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to record payment.');
    }
  };

  const handleRecordExpense = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/api/finance/expenditures/', expenseForm);
      setMsg(`Expenditure recorded successfully!`);
      setExpenseForm({ category: 'UTILITIES', purpose: '', amount: '', spent_on: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to record expenditure.');
    }
  };

  const handleViewReceipt = async (paymentId) => {
    try {
      const res = await api.get(`/api/finance/receipts/${paymentId}/`);
      setReceiptDetail(res.data);
    } catch (e) {
      setErr('Failed to load receipt details.');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-cash-coin me-2"></i>Finance & Accounting Ledger</h3>
          <p className="text-muted small">Append-only financial records, money receipts, operating expenditures, and faculty payroll</p>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      {/* Summary Ribbon */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-success border-4 rounded-3">
            <div className="card-body">
              <div className="small text-muted fw-semibold text-uppercase">Total Collections (Revenue)</div>
              <h3 className="fw-bold text-success mb-0">৳{Number(summary?.total_revenue || 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-danger border-4 rounded-3">
            <div className="card-body">
              <div className="small text-muted fw-semibold text-uppercase">Operating Expenditures</div>
              <h3 className="fw-bold text-danger mb-0">৳{Number(summary?.total_expenditure || 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4 rounded-3">
            <div className="card-body">
              <div className="small text-muted fw-semibold text-uppercase">Net Coaching Balance</div>
              <h3 className={`fw-bold mb-0 ${(summary?.balance || 0) >= 0 ? 'text-primary' : 'text-danger'}`}>
                ৳{Number(summary?.balance || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>
            <i className="bi bi-wallet-fill me-1"></i> Student Payments & Receipts
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
            <i className="bi bi-credit-card-2-front me-1"></i> Operating Expenses
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${tab === 'payroll' ? 'active' : ''}`} onClick={() => setTab('payroll')}>
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Teacher Payroll
          </button>
        </li>
      </ul>

      {/* Tab 1: Student Payments */}
      {tab === 'payments' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Record Student Payment</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleRecordPayment}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Enrollment (Student & Course)</label>
                    <select
                      className="form-select form-select-sm"
                      value={paymentForm.enrollment}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enrollment: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Student & Course --</option>
                      {enrollments.map((enr) => (
                        <option key={enr.id} value={enr.id}>
                          {enr.student_name} ({enr.student_username}) - {enr.course_name} [Due: ৳{enr.due_amount}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Payment Amount (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Payment Method</label>
                    <select
                      className="form-select form-select-sm"
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    >
                      <option value="CASH">Cash</option>
                      <option value="BKASH">bKash</option>
                      <option value="NAGAD">Nagad</option>
                      <option value="ROCKET">Rocket</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Payment Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={paymentForm.paid_on}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paid_on: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Remarks / TrxID</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Bkash Trx ID 9X7AB..."
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-success btn-sm w-100 fw-semibold">
                    Post Payment to Ledger
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Recent Payment Transactions</h6>
                <span className="badge bg-light text-dark border">{payments.length} transactions</span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Receipt #</th>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold text-primary">{p.receipt_no}</td>
                        <td>{p.student_name}</td>
                        <td>{p.course_name}</td>
                        <td className="fw-bold text-success">৳{p.amount.toLocaleString()}</td>
                        <td><span className="badge bg-light text-dark border">{p.method_display}</span></td>
                        <td className="small text-muted">{p.paid_on}</td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm py-0"
                            onClick={() => handleViewReceipt(p.id)}
                          >
                            <i className="bi bi-printer me-1"></i> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses */}
      {tab === 'expenses' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Record Operating Expense</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleRecordExpense}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    >
                      <option value="RENT">Office / Campus Rent</option>
                      <option value="UTILITIES">Electricity & Internet</option>
                      <option value="TEACHER_SALARY">Teacher Salaries</option>
                      <option value="OFFICE_SUPPLIES">Paper, Ink & Supplies</option>
                      <option value="MARKETING">Marketing & Banners</option>
                      <option value="OTHER">Other Operational Expense</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Specific Purpose</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. November Internet Bill"
                      value={expenseForm.purpose}
                      onChange={(e) => setExpenseForm({ ...expenseForm, purpose: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Amount (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={expenseForm.spent_on}
                      onChange={(e) => setExpenseForm({ ...expenseForm, spent_on: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-danger btn-sm w-100 fw-semibold">
                    Post Expense to Ledger
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Operating Expenses Ledger</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((ex) => (
                      <tr key={ex.id}>
                        <td className="small text-muted">{ex.spent_on}</td>
                        <td><span className="badge bg-secondary">{ex.category_display}</span></td>
                        <td className="fw-semibold">{ex.purpose}</td>
                        <td className="fw-bold text-danger">৳{ex.amount.toLocaleString()}</td>
                        <td className="small">{ex.recorded_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payroll */}
      {tab === 'payroll' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h6 className="mb-0 fw-bold">Dynamic Teacher Payroll Report</h6>
              <span className="small text-muted">Automatically aggregates sessions held * remuneration rate</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(Number(e.target.value))}
              >
                {[...Array(12).keys()].map((m) => (
                  <option key={m + 1} value={m + 1}>Month {m + 1}</option>
                ))}
              </select>
              <select
                className="form-select form-select-sm"
                value={payrollYear}
                onChange={(e) => setPayrollYear(Number(e.target.value))}
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Teacher</th>
                  <th>Designation</th>
                  <th>Sessions Held (This Month)</th>
                  <th>Calculated Remuneration</th>
                </tr>
              </thead>
              <tbody>
                {payroll?.payroll_list && payroll.payroll_list.length > 0 ? (
                  payroll.payroll_list.map((p) => (
                    <tr key={p.teacher_id}>
                      <td className="fw-semibold">{p.teacher_name} ({p.teacher_username})</td>
                      <td>{p.designation}</td>
                      <td><span className="badge bg-info text-white">{p.total_sessions} classes</span></td>
                      <td className="fw-bold text-success fs-6">৳{p.total_salary.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">No teacher payroll data for this period.</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan="3" className="text-end">Total Faculty Payroll Obligation:</th>
                  <th className="text-success fs-5">৳{Number(payroll?.total_payroll || 0).toLocaleString()}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptDetail && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="bi bi-mortarboard-fill me-2"></i>Biddyangon Money Receipt
                </h5>
                <button type="button" className="btn-close" onClick={() => setReceiptDetail(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Receipt No:</span>
                    <strong className="text-primary">{receiptDetail.receipt_no}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Date:</span>
                    <strong>{receiptDetail.paid_on}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Payment Method:</span>
                    <strong>{receiptDetail.method}</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-muted small text-uppercase">Student Details</h6>
                  <p className="mb-0 fw-semibold">{receiptDetail.student_name} ({receiptDetail.student_username})</p>
                  <p className="text-muted small mb-0">Class & Section: {receiptDetail.section}</p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-muted small text-uppercase">Payment Item</h6>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span>{receiptDetail.course_name} ({receiptDetail.course_code})</span>
                    <span className="fw-bold text-success">৳{receiptDetail.amount_paid.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Total Agreed Course Fee:</span>
                    <span>৳{receiptDetail.course_fee_total.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between small fw-bold text-danger">
                    <span>Remaining Due:</span>
                    <span>৳{receiptDetail.remaining_due.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 text-muted small">
                  <div>Received By: <strong>{receiptDetail.received_by}</strong></div>
                  {receiptDetail.remarks && <div>Remarks: {receiptDetail.remarks}</div>}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReceiptDetail(null)}>Close</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
