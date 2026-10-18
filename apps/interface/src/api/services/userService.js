import api from '../axiosInstance';

export const userService = {
  async getUsers(role = null) {
    const url = role ? `/users?role=${role}` : '/users';
    const response = await api.get(url);
    return response.data;
  },

  async createStaff(staffData) {
    const response = await api.post('/users', staffData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
