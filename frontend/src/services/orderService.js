// Task ID: 88cca822
import axios from 'axios';
import authService from './authService';
import mockData from '../mock/orderMock.json';

const API_URL = '/api/orders';
const USE_MOCK = true; // Set to false to use real API

/**
 * Order service for handling order-related API calls.
 */
class OrderService {
  /**
   * Get authorization headers with access token.
   * @private
   * @returns {Object} Headers object with authorization
   */
  _getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Create a new order.
   * @param {Object} orderData - Order creation data
   * @param {string} orderData.customer_name - Customer name
   * @param {string} orderData.customer_email - Customer email
   * @param {string} [orderData.notes] - Optional order notes
   * @param {Array} orderData.items - Array of order items
   * @returns {Promise<Object>} Created order with auto-generated order_number
   */
  async createOrder(orderData) {
    try {
      const response = await axios.post(API_URL, orderData, this._getAuthHeaders());
      return response.data;
    } catch (error) {
      // Handle token refresh on 401
      if (error.response?.status === 401) {
        await authService.refreshToken();
        // Retry request with new token
        const retryResponse = await axios.post(API_URL, orderData, this._getAuthHeaders());
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to create order' };
    }
  }

  /**
   * Get a specific order by ID.
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details with items
   */
  async getOrder(orderId) {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`, this._getAuthHeaders());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const retryResponse = await axios.get(`${API_URL}/${orderId}`, this._getAuthHeaders());
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to fetch order' };
    }
  }

  /**
   * Get all orders with pagination.
   * @param {number} [skip=0] - Number of records to skip
   * @param {number} [limit=100] - Maximum number of records
   * @returns {Promise<Array>} List of orders
   */
  async getOrders(skip = 0, limit = 100) {
    try {
      const response = await axios.get(`${API_URL}?skip=${skip}&limit=${limit}`, this._getAuthHeaders());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const retryResponse = await axios.get(`${API_URL}?skip=${skip}&limit=${limit}`, this._getAuthHeaders());
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to fetch orders' };
    }
  }

  /**
   * Get orders with pagination and filters.
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.per_page=10] - Items per page
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.start_date] - Filter by start date (ISO format)
   * @param {string} [params.end_date] - Filter by end date (ISO format)
   * @returns {Promise<Object>} Paginated orders response with items, total, page, per_page, total_pages
   */
  async getOrdersPaginated(params = {}) {
    const { page = 1, per_page = 10, status = null, start_date = null, end_date = null } = params;

    if (USE_MOCK) {
      // Simulate API call with mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredOrders = [...mockData.orders];

          // Apply status filter
          if (status) {
            filteredOrders = filteredOrders.filter(order => order.status === status);
          }

          // Apply date filters
          if (start_date) {
            filteredOrders = filteredOrders.filter(order =>
              new Date(order.created_at) >= new Date(start_date)
            );
          }

          if (end_date) {
            filteredOrders = filteredOrders.filter(order =>
              new Date(order.created_at) <= new Date(end_date)
            );
          }

          // Sort by created_at descending
          filteredOrders.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          );

          // Calculate pagination
          const total = filteredOrders.length;
          const total_pages = Math.ceil(total / per_page);
          const start = (page - 1) * per_page;
          const end = start + per_page;
          const items = filteredOrders.slice(start, end);

          resolve({
            items,
            total,
            page,
            per_page,
            total_pages
          });
        }, 300); // Simulate network delay
      });
    }

    try {
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('per_page', per_page);
      if (status) queryParams.append('status', status);
      if (start_date) queryParams.append('start_date', start_date);
      if (end_date) queryParams.append('end_date', end_date);

      const response = await axios.get(`${API_URL}?${queryParams.toString()}`, this._getAuthHeaders());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('per_page', per_page);
        if (status) queryParams.append('status', status);
        if (start_date) queryParams.append('start_date', start_date);
        if (end_date) queryParams.append('end_date', end_date);

        const retryResponse = await axios.get(`${API_URL}?${queryParams.toString()}`, this._getAuthHeaders());
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to fetch orders' };
    }
  }
}

export default new OrderService();
