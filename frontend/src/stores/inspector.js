import { defineStore } from 'pinia';
import InspectorService from '@/services/inspector.service';

export const useInspectorStore = defineStore('inspector', {
  state: () => ({
    // List of available materialized views
    views: [],
    filteredViews: [],
    // Currently selected view
    selectedView: null,
    // Data from the selected view (array of objects)
    tableData: [],
    // Column headers extracted from data
    headers: [],
    // Metadata
    rowCount: 0,
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Check if table data is available
     */
    hasData: (state) => state.tableData.length > 0,
  },

  actions: {
    /**
     * Fetch list of available Materialized Views
     */
    async fetchViews() {
      this.loading = true;
      this.error = null;
      try {
        const response = await InspectorService.getViewList();
        // API response: { data: ["mv_mahasiswa_gender", "mv_ipk_stats", ...] }
        this.views = response.data.data || [];
        this.filteredViews = this.views;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat daftar view';
        console.error('Error fetching views:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Select a view and fetch its data
     * @param {string} viewName - Name of the materialized view
     */
    async selectView(viewName) {
      this.selectedView = viewName;
      this.loading = true;
      this.tableData = [];
      this.headers = [];
      this.rowCount = 0;
      this.error = null;
      
      try {
        const response = await InspectorService.getViewData(viewName);
        // API response: { data: [{ col1: val1, col2: val2, ... }, ...] }
        const data = response.data.data || [];
        this.tableData = data;
        this.rowCount = data.length;
        
        // Extract headers from the first row's keys
        if (data.length > 0) {
          this.headers = Object.keys(data[0]);
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat data view';
        console.error('Error fetching view data:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Filter views based on search query
     * @param {string} query - Search query
     */
    filterViews(query) {
      if (!query) {
        this.filteredViews = this.views;
        return;
      }
      const lowerQuery = query.toLowerCase();
      this.filteredViews = this.views.filter(view => 
        view.toLowerCase().includes(lowerQuery)
      );
    },

    /**
     * Clear current selection and data
     */
    clearSelection() {
      this.selectedView = null;
      this.tableData = [];
      this.headers = [];
      this.rowCount = 0;
      this.error = null;
    }
  }
});
