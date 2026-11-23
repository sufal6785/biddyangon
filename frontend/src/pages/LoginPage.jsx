import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(username, password);
      if (loggedInUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (loggedInUser.role === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h3 className="fw-bold mt-2">Biddyangon Portal</h3>
                <p className="text-muted small">Sign in to access your coaching dashboard</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin or ssc26-001"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In <i className="bi bi-arrow-right ms-1"></i>
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div>
                <p className="small text-muted text-center mb-2 fw-semibold">Quick Demo Logins (Click to autofill):</p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDemoFill('admin', 'admin123')}
                  >
                    <i className="bi bi-shield-lock me-1"></i> Admin
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleDemoFill('teacher1', 'teacher123')}
                  >
                    <i className="bi bi-person-badge me-1"></i> Teacher
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleDemoFill('ssc26-001', 'student123')}
                  >
                    <i className="bi bi-backpack me-1"></i> Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
