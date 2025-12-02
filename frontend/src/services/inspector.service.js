import api from './api';

class InspectorService {
  /**
   * Fetch list of available Materialized Views
   * @returns {Promise} Response containing array of view names
   */
  getViewList() {
    return api.get('/datacore/inspector/mv');
  }

  /**
   * Fetch data from a specific Materialized View
   * @param {string} viewName - Name of the materialized view
   * @returns {Promise} Response containing array of row objects
   */
  getViewData(viewName) {
    return api.get(`/datacore/inspector/mv/${encodeURIComponent(viewName)}`);
  }
}

export default new InspectorService();
