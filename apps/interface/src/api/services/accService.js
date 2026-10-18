import api from '../axiosInstance';

export const accService = {
  async managerVehicleAcc(orderId, { vehicleId, price }) {
    const response = await api.put(`/acc/${orderId}/manager-vehicle`, { vehicleId, price });
    return response.data;
  },

  async supervisorAssignCourier(orderId, { courierId }) {
    const response = await api.put(`/acc/${orderId}/supervisor-assign`, { courierId });
    return response.data;
  },

  async courierDeliverAcc(orderId, { courier_proof_url }) {
    const response = await api.put(`/acc/${orderId}/courier-deliver`, { courier_proof_url });
    return response.data;
  },

  async clientReceiveAcc(orderId, { client_proof_url }) {
    const response = await api.put(`/acc/${orderId}/client-receive`, { client_proof_url });
    return response.data;
  },

  async supervisorVerifyAcc(orderId) {
    const response = await api.put(`/acc/${orderId}/supervisor-verify`);
    return response.data;
  },

  async managerFinalizeAcc(orderId) {
    const response = await api.put(`/acc/${orderId}/manager-finalize`);
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/acc/analytics');
    return response.data;
  }
};

export default accService;
