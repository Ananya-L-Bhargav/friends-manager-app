import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import DeleteModal from '../components/DeleteModal';
import Toast from '../components/Toast';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  Check,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';

export default function FriendDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Scratchpad personal notes stored locally for this friend
  const [note, setNote] = useState('');
  const [savedNoteStatus, setSavedNoteStatus] = useState(false);

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

  useEffect(() => {
    const fetchFriend = async () => {
      setLoading(true);
      try {
        const data = await api.getFriendById(id);
        setFriend(data);
        // Load personal notes for this friend
        const savedNote = localStorage.getItem(`friend_note_${id}`) || '';
        setNote(savedNote);
      } catch (err) {
        console.error('Error loading friend details:', err);
        addToast(err.message || 'Friend not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFriend();
  }, [id]);

  const handleSaveNote = () => {
    localStorage.setItem(`friend_note_${id}`, note);
    setSavedNoteStatus(true);
    addToast('Personal note saved!', 'success');
    setTimeout(() => setSavedNoteStatus(false), 2000);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    addToast(`Copied ${field} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.deleteFriend(id);
      addToast('Friend deleted successfully', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      addToast(err.message || 'Failed to delete friend', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'F';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const hobbiesList = friend?.hobbies
    ? friend.hobbies.split(',').map((h) => h.trim()).filter(Boolean)
    : [];

  return (
    <>
      <Navbar />

      <main className="page-wrapper">
        <div className="app-container detail-page-container">
          {/* Top navigation with Back to Friends List button */}
          <div className="detail-top-nav">
            <Link to="/dashboard" className="btn btn-secondary btn-sm" id="back-to-friends-btn">
              <ArrowLeft size={16} />
              <span>Back to Friends List</span>
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div
                className="spinner"
                style={{
                  width: '40px',
                  height: '40px',
                  borderColor: 'var(--accent-primary)',
                  borderTopColor: 'transparent'
                }}
              />
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                Loading profile...
              </p>
            </div>
          ) : !friend ? (
            <div className="glass-card empty-state">
              <h2 className="empty-title">Friend Not Found</h2>
              <p className="empty-desc">
                The friend profile you are looking for does not exist or has been removed.
              </p>
              <Link to="/dashboard" className="btn btn-primary">
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="glass-card detail-card">
                {/* Hero Gradient Banner */}
                <div className="detail-hero-banner" />

                <div className="detail-hero-body">
                  {/* Avatar & Action Row */}
                  <div className="detail-avatar-row">
                    <div className="avatar-wrapper">
                      {friend.image_url && !imageError ? (
                        <img
                          src={friend.image_url}
                          alt={friend.name}
                          className="detail-avatar-img"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="detail-avatar-fallback">
                          {getInitials(friend.name)}
                        </div>
                      )}
                    </div>

                    <div className="detail-action-buttons">
                      {friend.email && (
                        <a
                          href={`mailto:${friend.email}`}
                          className="btn btn-secondary btn-sm"
                          title="Send Email"
                        >
                          <Mail size={16} />
                          <span>Email</span>
                        </a>
                      )}
                      {friend.phone && (
                        <a
                          href={`tel:${friend.phone}`}
                          className="btn btn-secondary btn-sm"
                          title="Call Friend"
                        >
                          <Phone size={16} />
                          <span>Call</span>
                        </a>
                      )}
                      <Link
                        to={`/friends/${friend.id}/edit`}
                        className="btn btn-primary btn-sm"
                        id="edit-friend-btn"
                      >
                        <Edit2 size={16} />
                        <span>Edit Profile</span>
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowDeleteModal(true)}
                        id="delete-friend-btn"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="detail-title-section">
                    <h1 className="detail-name" id="friend-detail-name">{friend.name}</h1>
                    <div className="detail-meta-pills">
                      <span className="friend-role-badge" style={{ fontSize: '0.875rem', padding: '4px 12px' }}>
                        <Briefcase size={14} />
                        <span>{friend.role || 'Friend'}</span>
                      </span>
                      {friend.date_joined && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <Calendar size={14} />
                          <span>Connected since {friend.date_joined}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two column detail sections */}
                  <div className="detail-grid">
                    {/* Contact Info Card */}
                    <div className="detail-section-card">
                      <h2 className="detail-section-title">
                        <Mail size={18} color="var(--accent-primary)" />
                        <span>Contact Information</span>
                      </h2>

                      <div className="detail-info-list">
                        <div className="detail-info-row">
                          <span className="detail-info-label">
                            <Mail size={14} />
                            <span>Email</span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="detail-info-value">{friend.email || 'Not provided'}</span>
                            {friend.email && (
                              <button
                                type="button"
                                className="btn-icon btn-sm"
                                style={{ width: '28px', height: '28px' }}
                                onClick={() => handleCopy(friend.email, 'email')}
                                title="Copy Email"
                              >
                                {copiedField === 'email' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="detail-info-row">
                          <span className="detail-info-label">
                            <Phone size={14} />
                            <span>Phone</span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="detail-info-value">{friend.phone || 'Not provided'}</span>
                            {friend.phone && (
                              <button
                                type="button"
                                className="btn-icon btn-sm"
                                style={{ width: '28px', height: '28px' }}
                                onClick={() => handleCopy(friend.phone, 'phone')}
                                title="Copy Phone"
                              >
                                {copiedField === 'phone' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="detail-info-row">
                          <span className="detail-info-label">
                            <Calendar size={14} />
                            <span>Date Joined</span>
                          </span>
                          <span className="detail-info-value">{friend.date_joined || 'Not recorded'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hobbies & Interests Card */}
                    <div className="detail-section-card">
                      <h2 className="detail-section-title">
                        <Sparkles size={18} color="var(--accent-amber)" />
                        <span>Hobbies & Interests</span>
                      </h2>

                      {hobbiesList.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {hobbiesList.map((hobby, index) => (
                            <span
                              key={index}
                              className="hobby-tag"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.875rem',
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--border-subtle)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              #{hobby}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No hobbies or interests listed yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Biography Section */}
                  <div className="detail-section-card" style={{ marginTop: '24px' }}>
                    <h2 className="detail-section-title">
                      <Heart size={18} color="var(--accent-rose)" />
                      <span>About & Bio</span>
                    </h2>
                    <p className="detail-bio-text">
                      {friend.bio || 'No biography or story has been added for this friend yet.'}
                    </p>
                  </div>

                  {/* Personal Memory / Notes Scratchpad */}
                  <div className="detail-section-card notes-scratchpad">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h2 className="detail-section-title" style={{ margin: 0 }}>
                        <MessageSquare size={18} color="var(--accent-cyan)" />
                        <span>Personal Notes & Memories</span>
                      </h2>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleSaveNote}
                      >
                        {savedNoteStatus ? (
                          <>
                            <Check size={14} color="var(--accent-emerald)" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          'Save Note'
                        )}
                      </button>
                    </div>
                    <textarea
                      className="form-textarea"
                      placeholder="Write private notes, favorite memories, gift ideas, or coffee preferences..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        friend={friend}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
