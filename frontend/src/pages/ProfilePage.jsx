import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    designation: '',
    qualification: '',
    guardian_name: '',
    guardian_phone: '',
  });

  const [pwData, setPwData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get('/api/auth/profile/')
      .then((res) => {
        setFormData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          designation: res.data.designation || '',
          qualification: res.data.qualification || '',
          guardian_name: res.data.guardian_name || '',
          guardian_phone: res.data.guardian_phone || '',
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);
    try {
      const res = await api.put('/api/auth/profile/', formData);
      setProfileMsg('Profile updated successfully!');
      updateUser(res.data.user);
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (pwData.new_password !== pwData.confirm_password) {
      setPwErr('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      const res = await api.post('/api/auth/change-password/', {
        old_password: pwData.old_password,
        new_password: pwData.new_password,
      });
      setPwMsg(res.data.message || 'Password changed successfully!');
      setPwData({ old_password: '', new_password: '', confirm_password: '' });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4"><i className="bi bi-person-gear me-2"></i>My Profile</h3>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 fw-semibold">Personal Information</h5>
            </div>
            <div className="card-body p-4 pt-0">
              {profileMsg && <div className="alert alert-success py-2 small">{profileMsg}</div>}
              {profileErr && <div className="alert alert-danger py-2 small">{profileErr}</div>}

              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Location / Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  {user?.role === 'TEACHER' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Qualification</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.qualification}
                          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {user?.role === 'STUDENT' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Guardian Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.guardian_name}
                          onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Guardian Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.guardian_phone}
                          onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>

                <button type="submit" className="btn btn-primary mt-4 px-4 fw-semibold" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 fw-semibold">Change Password</h5>
            </div>
            <div className="card-body p-4 pt-0">
              {pwMsg && <div className="alert alert-success py-2 small">{pwMsg}</div>}
              {pwErr && <div className="alert alert-danger py-2 small">{pwErr}</div>}

              <form onSubmit={handlePwSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwData.old_password}
                    onChange={(e) => setPwData({ ...pwData, old_password: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwData.new_password}
                    onChange={(e) => setPwData({ ...pwData, new_password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwData.confirm_password}
                    onChange={(e) => setPwData({ ...pwData, confirm_password: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-outline-danger w-100 mt-2 fw-semibold" disabled={savingPw}>
                  {savingPw ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
