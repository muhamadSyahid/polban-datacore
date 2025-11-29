import api from './api';

class InspectorService {
  getKeys() {
    return api.get('/datacore/cache/keys');
  }

  getData(key) {
    return api.get(`/datacore/cache/${encodeURIComponent(key)}`);
  }
}

export default new InspectorService();
