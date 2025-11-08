/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Include cookies for sessions
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // User profile endpoints
  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserCollection(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/collection?${queryString}`);
  }

  // Card endpoints
  async getCards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/cards?${queryString}`);
  }

  async getBrowseCards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/cards/browse?${queryString}`);
  }

  async getCard(cardId) {
    return this.request(`/cards/${cardId}`);
  }

  async createCard(cardData) {
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async updateCard(cardId, cardData) {
    return this.request(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  }

  async deleteCard(cardId) {
    return this.request(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async getCollectionStats() {
    return this.request('/cards/stats/summary');
  }

  // Inventory endpoints
  async addToInventory(cardId, inventoryData = {}) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify({
        cardId,
        ...inventoryData
      }),
    });
  }

  async updateInventory(cardId, inventoryData) {
    return this.request(`/inventory/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData),
    });
  }

  async removeFromInventory(cardId) {
    return this.request(`/inventory/${cardId}`, {
      method: 'DELETE',
    });
  }

  async getInventoryCard(cardId) {
    return this.request(`/inventory/${cardId}`);
  }
}

export default new ApiService();
