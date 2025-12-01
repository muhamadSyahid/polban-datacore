<template>
  <div class="layout-wrapper">
    <AppSidebar />
    
    <div class="main-content">
      <AppHeader />
      
      <div class="content-body">
        <div class="inspector-container">
          <!-- Left Panel: Views List -->
          <div class="inspector-sidebar">
            <div class="sidebar-header">
              <h3 class="sidebar-title">Materialized Views</h3>
            </div>
            <div class="search-box">
              <div class="search-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="handleSearch" 
                  placeholder="Cari View..." 
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="views-list">
              <div v-if="inspectorStore.loading && !inspectorStore.views.length" class="loading-state">
                <div class="spinner-sm"></div>
                <span>Memuat views...</span>
              </div>
              
              <div v-else-if="inspectorStore.filteredViews.length === 0" class="empty-state">
                <span>Tidak ada view ditemukan</span>
              </div>
              
              <button 
                v-for="view in inspectorStore.filteredViews" 
                :key="view"
                @click="handleSelectView(view)"
                class="view-item"
                :class="{ 'active': inspectorStore.selectedView === view }"
              >
                <div class="view-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <span class="view-text">{{ view }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <!-- Right Panel: Data Preview -->
          <div class="inspector-preview">
            <div class="preview-header">
              <div class="header-left">
                <h3 class="preview-title">
                  <span v-if="inspectorStore.selectedView">{{ inspectorStore.selectedView }}</span>
                  <span v-else class="placeholder-title">Data Inspector</span>
                </h3>
                <span v-if="inspectorStore.hasData" class="row-count">
                  {{ inspectorStore.rowCount }} baris
                </span>
              </div>
              <div v-if="inspectorStore.selectedView" class="header-actions">
                <!-- View Mode Toggle -->
                <div class="view-toggle">
                  <button 
                    @click="viewMode = 'table'" 
                    class="toggle-btn"
                    :class="{ 'active': viewMode === 'table' }"
                    title="Tampilan Tabel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                  </button>
                  <button 
                    @click="viewMode = 'json'" 
                    class="toggle-btn"
                    :class="{ 'active': viewMode === 'json' }"
                    title="Tampilan JSON"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  </button>
                </div>
                <button @click="handleRefresh" class="action-btn" title="Refresh Data">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </div>
            </div>

            <div class="preview-body">
              <div v-if="inspectorStore.loading && inspectorStore.selectedView" class="loading-overlay">
                <div class="spinner"></div>
                <p>Mengambil data...</p>
              </div>

              <!-- Table View (Default) -->
              <div v-else-if="inspectorStore.hasData && viewMode === 'table'" class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th v-for="header in inspectorStore.headers" :key="header">
                        {{ formatHeader(header) }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in inspectorStore.tableData" :key="index">
                      <td v-for="header in inspectorStore.headers" :key="header">
                        {{ formatCellValue(row[header]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- JSON View -->
              <div v-else-if="inspectorStore.hasData && viewMode === 'json'" class="json-viewer">
                <pre><code>{{ JSON.stringify(inspectorStore.tableData, null, 2) }}</code></pre>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-preview">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <h3>Pilih Materialized View</h3>
                <p>Pilih salah satu view di panel kiri untuk melihat data dalam format tabel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useInspectorStore } from '@/stores/inspector';
import AppSidebar from '@/components/Layout/AppSidebar.vue';
import AppHeader from '@/components/Layout/AppHeader.vue';

const inspectorStore = useInspectorStore();
const searchQuery = ref('');
const viewMode = ref('table'); // 'table' or 'json'

const handleSearch = () => {
  inspectorStore.filterViews(searchQuery.value);
};

const handleSelectView = (view) => {
  viewMode.value = 'table'; // Reset to table view on new selection
  inspectorStore.selectView(view);
};

const handleRefresh = () => {
  if (inspectorStore.selectedView) {
    inspectorStore.selectView(inspectorStore.selectedView);
  }
};

/**
 * Format header name for display (snake_case to Title Case)
 */
const formatHeader = (header) => {
  return header
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format cell value for display
 */
const formatCellValue = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

onMounted(() => {
  inspectorStore.fetchViews();
});
</script>

<style scoped>
/* Layout Variables */
:root {
  --color-primary: #21308f;
  --color-bg-light: #f8fafc;
  --color-border: #e2e8f0;
  --color-text-main: #334155;
  --color-text-muted: #64748b;
}

.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow: hidden;
  display: flex;
}

.inspector-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* Sidebar List (Left Panel) */
.inspector-sidebar {
  width: 30%;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #21308f;
}

.sidebar-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #21308f;
}

.views-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.view-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  color: #334155;
}

.view-item:hover {
  background-color: #f1f5f9;
}

.view-item.active {
  background-color: #eff6ff;
  color: #21308f;
  font-weight: 500;
  border-left: 4px solid #21308f;
  border-radius: 4px 8px 8px 4px;
}

.view-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.view-item.active .view-icon {
  color: #21308f;
}

.view-text {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.chevron-icon {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.view-item.active .chevron-icon {
  opacity: 1;
}

/* Preview Panel (Right Panel) */
.inspector-preview {
  width: 70%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.preview-header {
  height: 60px;
  padding: 0 24px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: #21308f;
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
}

.placeholder-title {
  font-family: 'Poppins', sans-serif;
  color: #64748b;
}

.row-count {
  font-size: 0.75rem;
  color: white;
  background-color: #21308f;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-toggle {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 6px;
  padding: 2px;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  color: #21308f;
}

.toggle-btn.active {
  background-color: white;
  color: #21308f;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f1f5f9;
  color: #21308f;
}

.preview-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  padding: 0;
}

/* Table Styles */
.table-container {
  height: 100%;
  overflow: auto;
  padding: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.data-table th {
  background-color: #21308f;
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 14px 16px;
  white-space: nowrap;
  border-bottom: 2px solid #1a2570;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  background-color: white;
}

.data-table tbody tr:hover td {
  background-color: #f8fafc;
}

.data-table tbody tr:nth-child(even) td {
  background-color: #fafbfc;
}

.data-table tbody tr:nth-child(even):hover td {
  background-color: #f1f5f9;
}

/* JSON Viewer */
.json-viewer {
  height: 100%;
  overflow: auto;
  padding: 24px;
  background-color: #1e293b;
}

.json-viewer pre {
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #e2e8f0;
  line-height: 1.5;
}

/* Empty State */
.empty-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-align: center;
  padding: 32px;
}

.empty-icon {
  margin-bottom: 16px;
  color: #cbd5e1;
}

/* Loading States */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #21308f;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.spinner-sm {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #21308f;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.loading-state, .empty-state {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
