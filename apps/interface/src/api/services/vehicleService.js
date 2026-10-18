import api from '../axiosInstance';

export const vehicleService = {
  async getVehicles() {
    const response = await api.get('/vehicles');
    return response.data;
  },

  async createVehicle(vehicleData) {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  async updateVehicle(id, vehicleData) {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  async deleteVehicle(id) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};

export default vehicleService;
