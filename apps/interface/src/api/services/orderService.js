import api from '../axiosInstance';

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async verifyPayment(id) {
    const response = await api.put(`/orders/${id}/verify-payment`);
    return response.data;
  },

  async addIssue(id, issue_notes) {
    const response = await api.put(`/orders/${id}/issue`, { issue_notes });
    return response.data;
  },

  async cancelOrder(id) {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  }
};

export default orderService;
