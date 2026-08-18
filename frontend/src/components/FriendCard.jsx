import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';

export default function FriendCard({ friend, onDeleteClick }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'F';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCardClick = () => {
    navigate(`/friends/${friend.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/friends/${friend.id}/edit`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteClick(friend);
  };

  const hobbiesList = friend.hobbies
    ? friend.hobbies.split(',').map((h) => h.trim()).filter(Boolean)
    : [];

  return (
    <div className="glass-card glass-card-interactive friend-card" onClick={handleCardClick}>
      {/* Decorative cover bar */}
      <div className="friend-card-cover" />

      <div className="friend-card-body">
        {/* Avatar and Action row */}
        <div className="friend-card-avatar-row">
          <div className="avatar-wrapper">
            {friend.image_url && !imageError ? (
              <img
                src={friend.image_url}
                alt={friend.name}
                className="avatar-img"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="avatar-fallback">{getInitials(friend.name)}</div>
            )}
          </div>

          <div className="friend-card-actions">
            <button
              type="button"
              className="btn-icon btn-sm"
              onClick={handleEdit}
              title="Edit Friend Details"
              aria-label="Edit Friend"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              className="btn-icon btn-sm btn-danger"
              onClick={handleDelete}
              title="Delete Friend"
              aria-label="Delete Friend"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Friend Name & Role Badge */}
        <div className="friend-card-meta">
          <h3 className="friend-name">
            {friend.name}
            <ArrowUpRight size={16} className="text-muted" style={{ opacity: 0.6 }} />
          </h3>
          <span className="friend-role-badge">
            {friend.role || 'Friend'}
          </span>
        </div>

        {/* Bio Snippet */}
        <p className="friend-bio-snippet">
          {friend.bio || 'No bio provided yet.'}
        </p>

        {/* Quick Contact Info */}
        <div className="friend-contact-quick">
          {friend.email && (
            <div className="contact-quick-item" title={friend.email}>
              <Mail size={13} style={{ flexShrink: 0 }} />
              <span>{friend.email}</span>
            </div>
          )}
          {friend.phone && (
            <div className="contact-quick-item" title={friend.phone}>
              <Phone size={13} style={{ flexShrink: 0 }} />
              <span>{friend.phone}</span>
            </div>
          )}
        </div>

        {/* Hobbies / Interests */}
        {hobbiesList.length > 0 && (
          <div className="friend-hobbies-row">
            {hobbiesList.slice(0, 3).map((hobby, idx) => (
              <span key={idx} className="hobby-tag">
                {hobby}
              </span>
            ))}
            {hobbiesList.length > 3 && (
              <span className="hobby-tag" style={{ opacity: 0.7 }}>
                +{hobbiesList.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="friend-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={13} />
            <span>
              {friend.date_joined
                ? `Joined ${friend.date_joined}`
                : 'Friend'}
            </span>
          </div>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            View Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
