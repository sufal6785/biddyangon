import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function StudentFees() {
  const [feeData, setFeeData] = useState(null);
  const [receiptDetail, setReceiptDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/finance/student-fees/')
      .then((res) => setFeeData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleViewReceipt = async (paymentId) => {
    try {
      const res = await api.get(`/api/finance/receipts/${paymentId}/`);
      setReceiptDetail(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading fee records...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-credit-card me-2"></i>My Tuition Fees & Dues</h3>
          <p className="text-muted small">Course fees, payment clearance status, and money receipts</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {feeData?.courses.map((c) => (
          <div key={c.id} className="col-md-6 col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0">{c.course_name}</h5>
                  <span className="badge bg-secondary">{c.course_code}</span>
                </div>
                <div className="my-3 p-3 bg-light rounded-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Agreed Fee:</span>
                    <strong className="text-dark">৳{c.fee_total.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Paid to Date:</span>
                    <strong className="text-success">৳{c.total_paid.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between small fw-bold">
                    <span>Outstanding Due:</span>
                    <strong className={c.due_amount > 0 ? 'text-danger' : 'text-success'}>
                      ৳{c.due_amount.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div>
                  {c.is_cleared ? (
                    <div className="alert alert-success py-2 mb-0 small text-center fw-semibold">
                      <i className="bi bi-check-circle me-1"></i> Fee Cleared (Eligible for Exams)
                    </div>
                  ) : (
                    <div className="alert alert-warning py-2 mb-0 small text-center fw-semibold text-dark">
                      <i className="bi bi-exclamation-circle me-1"></i> Outstanding Balance (Exam Locked)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-bold">Payment Receipts History</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Receipt #</th>
                <th>Course</th>
                <th>Amount Paid</th>
                <th>Payment Method</th>
                <th>Payment Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feeData?.payments && feeData.payments.length > 0 ? (
                feeData.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold text-primary">{p.receipt_no}</td>
                    <td>{p.course_name}</td>
                    <td className="fw-bold text-success">৳{p.amount.toLocaleString()}</td>
                    <td><span className="badge bg-light text-dark border">{p.method}</span></td>
                    <td className="small text-muted">{p.paid_on}</td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm py-0"
                        onClick={() => handleViewReceipt(p.id)}
                      >
                        <i className="bi bi-printer me-1"></i> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No payment receipts recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <span className="text-muted small">Method:</span>
                    <strong>{receiptDetail.method}</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="fw-semibold">{receiptDetail.course_name}</span>
                    <span className="fw-bold text-success">৳{receiptDetail.amount_paid.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 small">
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Agreed Course Fee:</span>
                    <span>৳{receiptDetail.course_fee_total.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold text-danger">
                    <span>Remaining Due:</span>
                    <span>৳{receiptDetail.remaining_due.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 text-muted small">
                  <div>Issued By: <strong>{receiptDetail.received_by}</strong></div>
                  {receiptDetail.remarks && <div>Note: {receiptDetail.remarks}</div>}
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
