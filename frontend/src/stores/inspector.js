import { defineStore } from 'pinia';
import InspectorService from '@/services/inspector.service';

export const useInspectorStore = defineStore('inspector', {
  state: () => ({
    keys: [],
    filteredKeys: [],
    selectedKey: null,
    jsonData: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchKeys() {
      this.loading = true;
      this.error = null;
      try {
        const response = await InspectorService.getKeys();
        // Assuming response.data.data is the array of keys based on standard response format
        // or response.data if it's direct.
        // The prompt says: Response: { data: ["guest:mahasiswa:gender", ...] }
        this.keys = response.data.data || [];
        this.filteredKeys = this.keys;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch keys';
        console.error('Error fetching keys:', err);
      } finally {
        this.loading = false;
      }
    },

    async selectKey(key) {
      this.selectedKey = key;
      this.loading = true;
      this.jsonData = null;
      this.error = null;
      try {
        const response = await InspectorService.getData(key);
        // Prompt says: Response: { data: { ...json object... } }
        this.jsonData = response.data.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch data';
        console.error('Error fetching data:', err);
      } finally {
        this.loading = false;
      }
    },

    filterKeys(query) {
      if (!query) {
        this.filteredKeys = this.keys;
        return;
      }
      const lowerQuery = query.toLowerCase();
      this.filteredKeys = this.keys.filter(key => 
        key.toLowerCase().includes(lowerQuery)
      );
    }
  }
});
