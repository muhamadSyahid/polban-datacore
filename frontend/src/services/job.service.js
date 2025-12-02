import api from './api';

export default {
  runJob(jobName) {
    return api.post('/jobs/run', { jobName });
  },

  getHistory(params) {
    return api.get('/datacore/jobs/history', { params });
  }
};
