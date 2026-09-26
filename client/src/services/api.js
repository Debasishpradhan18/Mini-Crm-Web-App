const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('nexus_crm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('nexus_crm_token');
      localStorage.removeItem('nexus_crm_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth API
  auth: {
    async login(credentials) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    async register(userData) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    async demoLogin() {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(res);
    },
    async getMe() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async updateProfile(profileData) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      return handleResponse(res);
    }
  },

  // Contacts API
  contacts: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/contacts?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async getById(id) {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async create(contactData) {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contactData)
      });
      return handleResponse(res);
    },
    async update(id, contactData) {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(contactData)
      });
      return handleResponse(res);
    },
    async delete(id) {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async addNote(id, note) {
      const res = await fetch(`${API_BASE}/contacts/${id}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note })
      });
      return handleResponse(res);
    }
  },

  // Deals API
  deals: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/deals?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async getPipelineSummary() {
      const res = await fetch(`${API_BASE}/deals/pipeline/summary`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async getById(id) {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async create(dealData) {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dealData)
      });
      return handleResponse(res);
    },
    async update(id, dealData) {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dealData)
      });
      return handleResponse(res);
    },
    async updateStage(id, stage) {
      const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stage })
      });
      return handleResponse(res);
    },
    async delete(id) {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Activities API
  activities: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/activities?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    async create(activityData) {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityData)
      });
      return handleResponse(res);
    }
  },

  // Analytics API
  analytics: {
    async getOverview() {
      const res = await fetch(`${API_BASE}/analytics/overview`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // AI Assist API
  ai: {
    async draftEmail(payload) {
      const res = await fetch(`${API_BASE}/ai/draft-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    },
    async summarizeContact(contactId) {
      const res = await fetch(`${API_BASE}/ai/summarize-contact`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ contactId })
      });
      return handleResponse(res);
    },
    async analyzeDeal(dealId) {
      const res = await fetch(`${API_BASE}/ai/analyze-deal`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dealId })
      });
      return handleResponse(res);
    }
  },

  // Seed / Reset
  seed: {
    async reset() {
      const res = await fetch(`${API_BASE}/seed/reset`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};
