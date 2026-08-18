import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import FriendCard from '../components/FriendCard';
import DeleteModal from '../components/DeleteModal';
import Toast from '../components/Toast';
import {
  Users,
  UserPlus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Calendar,
  Frown,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [toasts, setToasts] = useState([]);

  // Delete modal state
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const data = await api.getFriends();
      setFriends(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      addToast('Failed to load friends list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Extract unique roles for filtering
  const uniqueRoles = useMemo(() => {
    const roles = new Set();
    friends.forEach((f) => {
      if (f.role && f.role.trim()) {
        roles.add(f.role.trim());
      }
    });
    return ['All', ...Array.from(roles)];
  }, [friends]);

  // Filter and sort friends
  const filteredFriends = useMemo(() => {
    return friends
      .filter((friend) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          friend.name?.toLowerCase().includes(query) ||
          friend.email?.toLowerCase().includes(query) ||
          friend.role?.toLowerCase().includes(query) ||
          friend.bio?.toLowerCase().includes(query) ||
          friend.hobbies?.toLowerCase().includes(query);

        const matchesRole =
          selectedRole === 'All' ||
          friend.role?.toLowerCase() === selectedRole.toLowerCase();

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'date') {
          return (b.date_joined || '').localeCompare(a.date_joined || '');
        }
        if (sortBy === 'role') {
          return (a.role || '').localeCompare(b.role || '');
        }
        return 0;
      });
  }, [friends, searchQuery, selectedRole, sortBy]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await api.deleteFriend(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
      addToast('Friend removed successfully', 'success');
      setFriendToDelete(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete friend', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="page-wrapper">
        <div className="app-container">
          {/* Hero Section */}
          <div className="dashboard-hero">
            <div className="dashboard-heading-group">
              <h1>Friends Dashboard</h1>
              <p>Explore your inner circle, find mutual interests, and manage connections.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fetchFriends}
                title="Refresh list"
                aria-label="Refresh list"
              >
                <RefreshCw size={16} className={loading ? 'spinner' : ''} />
                <span>Refresh</span>
              </button>

              <Link to="/friends/new" className="btn btn-primary" id="add-friend-hero-btn">
                <UserPlus size={18} />
                <span>Add New Friend</span>
              </Link>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="metrics-strip">
            <div className="glass-card metric-card">
              <div className="metric-icon-box indigo">
                <Users size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{friends.length}</span>
                <span className="metric-label">Total Connections</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div className="metric-icon-box emerald">
                <Layers size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {uniqueRoles.length > 1 ? uniqueRoles.length - 1 : 0}
                </span>
                <span className="metric-label">Distinct Roles</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div className="metric-icon-box amber">
                <Calendar size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {friends.filter((f) => f.date_joined).length}
                </span>
                <span className="metric-label">Milestones Tracked</span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="filter-toolbar">
            <div className="search-box">
              <span className="input-icon">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-input has-left-icon"
                placeholder="Search friends by name, role, email, hobbies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-friends-input"
              />
            </div>

            <div className="filter-controls">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} className="text-muted" />
                <select
                  className="form-select btn-sm"
                  style={{ width: 'auto', padding: '8px 12px' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort friends list"
                >
                  <option value="name">Sort by Name (A-Z)</option>
                  <option value="date">Sort by Join Date</option>
                  <option value="role">Sort by Role</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role Filter Chips */}
          {uniqueRoles.length > 2 && (
            <div className="role-pill-group" style={{ marginBottom: '24px' }}>
              {uniqueRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-pill ${selectedRole === role ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          {/* Friends Grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                Loading friends...
              </p>
            </div>
          ) : filteredFriends.length > 0 ? (
            <div className="friends-grid" id="friends-grid-container">
              {filteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onDeleteClick={(f) => setFriendToDelete(f)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card empty-state">
              <div className="empty-icon-box">
                <Frown size={36} />
              </div>
              <h2 className="empty-title">No Friends Found</h2>
              <p className="empty-desc">
                {searchQuery || selectedRole !== 'All'
                  ? 'No friend matches your search criteria. Try clearing search filters.'
                  : "You haven't added any friends yet. Start growing your network today!"}
              </p>
              {searchQuery || selectedRole !== 'All' ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRole('All');
                  }}
                >
                  Clear Filters
                </button>
              ) : (
                <Link to="/friends/new" className="btn btn-primary">
                  <UserPlus size={18} />
                  <span>Add First Friend</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!friendToDelete}
        friend={friendToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setFriendToDelete(null)}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
}