// Task ID: 1cf37973, 61b9a31e
import axios from 'axios';
import authService from './authService';
import mockData from '../mock/dashboardMock.json';

const API_URL = '/api/dashboard';
const USE_MOCK = false; // Set to false to use real API

/**
 * Dashboard service for handling dashboard-related API calls.
 */
class DashboardService {
  /**
   * Get authorization headers with access token.
   * Task ID: 61b9a31e
   * @private
   * @returns {Object} Headers object with authorization
   * @throws {Error} If no access token is available
   */
  _getAuthHeaders() {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available. Please login.');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Get dashboard summary with metrics.
   * Task ID: 1cf37973
   * @returns {Promise<Object>} Dashboard summary with metrics
   * @returns {number} total_orders - Total number of orders
   * @returns {number} orders_today - Number of orders created today
   * @returns {number} total_revenue - Total revenue from all orders
   * @returns {number} revenue_today - Revenue from orders created today
   * @returns {Object} orders_by_status - Count of orders by status
   * @returns {Array} recent_orders - Last 5 orders
   */
  async getDashboardSummary() {
    if (USE_MOCK) {
      // Simulate API call with mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockData.summary);
        }, 300); // Simulate network delay
      });
    }

    try {
      const response = await axios.get(`${API_URL}/summary`, this._getAuthHeaders());
      return response.data;
    } catch (error) {
      // Handle token refresh on 401
      if (error.response?.status === 401) {
        await authService.refreshToken();
        // Retry request with new token
        const retryResponse = await axios.get(`${API_URL}/summary`, this._getAuthHeaders());
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to fetch dashboard summary' };
    }
  }
}

export default new DashboardService();
