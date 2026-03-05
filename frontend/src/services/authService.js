// Task ID: c0c28f55
import axios from 'axios';

const API_URL = '/api/auth';

/**
 * Auth service for handling authentication API calls.
 * In development, uses mock data. In production, calls real API.
 */
class AuthService {
  /**
   * Register a new user.
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.full_name - User full name
   * @returns {Promise<Object>} User data without password
   */
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed' };
    }
  }

  /**
   * Login user and get JWT tokens.
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Token data with access_token and refresh_token
   */
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { access_token, refresh_token } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  }

  /**
   * Refresh access token using refresh token.
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/refresh`, { refresh_token });
      const { access_token, refresh_token: new_refresh_token } = response.data;

      // Update tokens in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', new_refresh_token);

      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens
      this.logout();
      throw error.response?.data || { detail: 'Token refresh failed' };
    }
  }

  /**
   * Get current user profile.
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      // If token is invalid, try to refresh
      if (error.response?.status === 401) {
        await this.refreshToken();
        return this.getCurrentUser(); // Retry with new token
      }
      throw error.response?.data || { detail: 'Failed to get user data' };
    }
  }

  /**
   * Logout user by clearing stored tokens.
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Check if user is authenticated.
   * @returns {boolean} True if access token exists
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get stored access token.
   * @returns {string|null} Access token or null
   */
  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();
