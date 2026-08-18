import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Dices
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
];

export default function FriendForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    bio: '',
    hobbies: '',
    image_url: '',
    date_joined: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(isEditMode);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // If editing, fetch initial friend info
  useEffect(() => {
    if (isEditMode) {
      const loadFriend = async () => {
        try {
          const data = await api.getFriendById(id);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || '',
            bio: data.bio || '',
            hobbies: data.hobbies || '',
            image_url: data.image_url || '',
            date_joined: data.date_joined || new Date().toISOString().split('T')[0]
          });
        } catch (err) {
          console.error(err);
          addToast('Could not load friend details for editing', 'error');
        } finally {
          setFetchingInitial(false);
        }
      };

      loadFriend();
    }
  }, [id, isEditMode]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRandomAvatar = () => {
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    setFormData((prev) => ({ ...prev, image_url: randomAvatar }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Please fix validation errors before submitting', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await api.updateFriend(id, formData);
        addToast('Friend profile updated successfully!', 'success');
        setTimeout(() => {
          navigate(`/friends/${id}`);
        }, 600);
      } else {
        const res = await api.createFriend(formData);
        addToast('New friend added to your circle!', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Operation failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  if (fetchingInitial) {
    return (
      <>
        <Navbar />
        <main className="page-wrapper">
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Loading friend details...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-wrapper">
        <div className="app-container form-page-container">
          {/* Back button navigation */}
          <div style={{ marginBottom: '20px' }}>
            <Link
              to={isEditMode ? `/friends/${id}` : '/dashboard'}
              className="btn btn-secondary btn-sm"
              id="back-btn"
            >
              <ArrowLeft size={16} />
              <span>{isEditMode ? 'Cancel & Return' : 'Back to Dashboard'}</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="glass-card form-card">
            <div className="form-header">
              <h1 id="form-heading">
                {isEditMode ? 'Edit Friend Profile' : 'Create New Friend'}
              </h1>
              <p>
                {isEditMode
                  ? 'Update contact info, role, hobbies, and personal details.'
                  : 'Add a new member to your network with their contact details and interests.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Avatar Live Preview & Picker */}
              <div className="avatar-preview-box">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="preview-avatar-circle"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="preview-avatar-circle">
                    {formData.name ? formData.name.slice(0, 2).toUpperCase() : <User size={24} />}
                  </div>
                )}

                <div className="avatar-preset-picker">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Photo Presets
                    </span>
                    <button
                      type="button"
                      className="btn-icon btn-sm"
                      style={{ width: '24px', height: '24px' }}
                      onClick={handleRandomAvatar}
                      title="Pick Random Avatar"
                    >
                      <Dices size={13} />
                    </button>
                  </div>
                  <div className="avatar-presets">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        className="preset-chip"
                        onClick={() => setFormData((prev) => ({ ...prev, image_url: url }))}
                      >
                        Avatar {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 1: Name and Email */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="friend-name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <div className="input-container">
                    <span className="input-icon">
                      <User size={18} />
                    </span>
                    <input
                      id="friend-name"
                      name="name"
                      type="text"
                      className={`form-input has-left-icon ${errors.name ? 'input-error' : ''}`}
                      placeholder="e.g. Maya Lin"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.name && (
                    <span className="form-error-msg">
                      <AlertCircle size={13} />
                      <span>{errors.name}</span>
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="friend-email">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <div className="input-container">
                    <span className="input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      id="friend-email"
                      name="email"
                      type="email"
                      className={`form-input has-left-icon ${errors.email ? 'input-error' : ''}`}
                      placeholder="e.g. maya@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && (
                    <span className="form-error-msg">
                      <AlertCircle size={13} />
                      <span>{errors.email}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Phone & Role */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="friend-phone">
                    Phone Number
                  </label>
                  <div className="input-container">
                    <span className="input-icon">
                      <Phone size={18} />
                    </span>
                    <input
                      id="friend-phone"
                      name="phone"
                      type="tel"
                      className="form-input has-left-icon"
                      placeholder="e.g. +1 (555) 349-2810"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="friend-role">
                    Role / Category
                  </label>
                  <div className="input-container">
                    <span className="input-icon">
                      <Briefcase size={18} />
                    </span>
                    <input
                      id="friend-role"
                      name="role"
                      type="text"
                      className="form-input has-left-icon"
                      placeholder="e.g. UI/UX Designer, Architect, Roommate"
                      value={formData.role}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Image URL & Date Joined */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="friend-image">
                    Avatar Image URL
                  </label>
                  <div className="input-container">
                    <span className="input-icon">
                      <ImageIcon size={18} />
                    </span>
                    <input
                      id="friend-image"
                      name="image_url"
                      type="url"
                      className="form-input has-left-icon"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image_url}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="friend-date">
                    Date Joined / Connected
                  </label>
                  <div className="input-container">
                    <span className="input-icon">
                      <Calendar size={18} />
                    </span>
                    <input
                      id="friend-date"
                      name="date_joined"
                      type="date"
                      className="form-input has-left-icon"
                      value={formData.date_joined}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Hobbies / Interests */}
              <div className="form-group">
                <label className="form-label" htmlFor="friend-hobbies">
                  Hobbies & Interests
                </label>
                <div className="input-container">
                  <span className="input-icon">
                    <Sparkles size={18} />
                  </span>
                  <input
                    id="friend-hobbies"
                    name="hobbies"
                    type="text"
                    className="form-input has-left-icon"
                    placeholder="e.g. Photography, Hiking, Coffee, Chess (comma-separated)"
                    value={formData.hobbies}
                    onChange={handleChange}
                  />
                </div>
                <span className="form-hint">
                  Separate multiple hobbies with commas
                </span>
              </div>

              {/* Bio / Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="friend-bio">
                  Biography & Background
                </label>
                <textarea
                  id="friend-bio"
                  name="bio"
                  className="form-textarea"
                  placeholder="Share a short bio, mutual connections, or memories..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Form Action Buttons */}
              <div className="form-actions-footer">
                <Link
                  to={isEditMode ? `/friends/${id}` : '/dashboard'}
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  id="submit-friend-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Saving Friend...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>{isEditMode ? 'Update Friend' : 'Add Friend'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
