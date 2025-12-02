import api from './api';

export default {
  getStats() {
    return api.get('/datacore/dashboard/stats');
  }
};
