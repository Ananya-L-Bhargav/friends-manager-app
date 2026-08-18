/**
 * API Service Layer for FriendsPulse
 * Interacts with FastAPI backend with fallback resilience.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Initial fallback mock friends if backend is not started or seeded
const FALLBACK_FRIENDS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "9876543210",
    role: "Software Developer",
    bio: "Full-stack developer and technology enthusiast with a passion for open-source and modern web frameworks.",
    hobbies: "Cricket, Coding, Sci-Fi Movies",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    date_joined: "2026-01-15"
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@example.com",
    phone: "9876543211",
    role: "UI/UX Designer",
    bio: "Creative designer who loves crafting intuitive digital experiences, design systems, and mobile interfaces.",
    hobbies: "Design, Photography, Hiking",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    date_joined: "2026-02-10"
  },
  {
    id: 3,
    name: "Arjun Kumar",
    email: "arjun@example.com",
    phone: "9876543212",
    role: "Data Analyst",
    bio: "Loves analyzing complex trends, building predictive pipelines, and playing competitive football on weekends.",
    hobbies: "Football, Data Science, Chess",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    date_joined: "2026-03-05"
  },
  {
    id: 4,
    name: "Aisha Patel",
    email: "aisha@example.com",
    phone: "9876543213",
    role: "Product Manager",
    bio: "Passionate about building customer-centric products, roadmapping, and agile project execution.",
    hobbies: "Reading, Yoga, Specialty Coffee",
    image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    date_joined: "2026-04-12"
  }
];

function getStoredLocalFriends() {
  const cached = localStorage.getItem('friendspulse_fallback_friends');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('friendspulse_fallback_friends', JSON.stringify(FALLBACK_FRIENDS));
  return FALLBACK_FRIENDS;
}

function saveStoredLocalFriends(friends) {
  localStorage.setItem('friendspulse_fallback_friends', JSON.stringify(friends));
}

export const api = {
  // Login API
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please check credentials.');
      }
      return data;
    } catch (err) {
      // If network failure and using demo credentials, allow fallback
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        if ((username === 'ananya' && password === '123456') || (username === 'demo' && password === 'demo123')) {
          return {
            success: true,
            message: 'Offline Login successful',
            username: username,
            token: 'fallback-demo-token'
          };
        }
        throw new Error('Backend is unavailable and credentials not recognized.');
      }
      throw err;
    }
  },

  // Register API
  async register(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        return {
          success: true,
          message: 'Offline Register successful',
          username: username,
          token: 'fallback-demo-token'
        };
      }
      throw err;
    }
  },

  // Get All Friends API
  async getFriends() {
    try {
      const response = await fetch(`${API_BASE_URL}/friends`);
      if (!response.ok) {
        throw new Error('Failed to fetch friends from backend');
      }
      const data = await response.json();
      // Sync to local fallback storage
      if (Array.isArray(data) && data.length > 0) {
        saveStoredLocalFriends(data);
      }
      return data;
    } catch (err) {
      console.warn('Backend fetch failed, using stored local friends cache:', err.message);
      return getStoredLocalFriends();
    }
  },

  // Get Friend By ID
  async getFriendById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/friends/${id}`);
      if (!response.ok) {
        throw new Error('Friend not found');
      }
      return await response.json();
    } catch (err) {
      console.warn(`Backend fetch for friend ${id} failed, using local store:`, err.message);
      const friends = getStoredLocalFriends();
      const match = friends.find(f => String(f.id) === String(id));
      if (match) return match;
      throw new Error('Friend not found');
    }
  },

  // Create Friend API
  async createFriend(friendData) {
    try {
      const response = await fetch(`${API_BASE_URL}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(friendData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create friend');
      }
      return data;
    } catch (err) {
      console.warn('Backend create failed, saving to local store:', err.message);
      const friends = getStoredLocalFriends();
      const newFriend = {
        id: Date.now(),
        ...friendData
      };
      friends.unshift(newFriend);
      saveStoredLocalFriends(friends);
      return {
        success: true,
        message: 'Friend added locally',
        friend: newFriend
      };
    }
  },

  // Update Friend API
  async updateFriend(id, friendData) {
    try {
      const response = await fetch(`${API_BASE_URL}/friends/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(friendData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update friend');
      }
      return data;
    } catch (err) {
      console.warn('Backend update failed, updating local store:', err.message);
      const friends = getStoredLocalFriends();
      const index = friends.findIndex(f => String(f.id) === String(id));
      if (index !== -1) {
        friends[index] = { ...friends[index], ...friendData };
        saveStoredLocalFriends(friends);
        return {
          success: true,
          message: 'Friend updated locally',
          friend: friends[index]
        };
      }
      throw new Error('Friend not found to update');
    }
  },

  // Delete Friend API
  async deleteFriend(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/friends/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete friend');
      }
      return data;
    } catch (err) {
      console.warn('Backend delete failed, removing from local store:', err.message);
      const friends = getStoredLocalFriends();
      const filtered = friends.filter(f => String(f.id) !== String(id));
      saveStoredLocalFriends(filtered);
      return {
        success: true,
        message: 'Friend deleted locally',
        deleted_id: id
      };
    }
  }
};
