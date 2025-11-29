<template>
  <div class="layout-wrapper">
    <AppSidebar />
    
    <div class="main-content">
      <AppHeader />
      
      <div class="content-body">
        <div class="inspector-container">
          <!-- Left Panel: Sidebar List -->
          <div class="inspector-sidebar">
            <div class="search-box">
              <div class="search-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="handleSearch" 
                  placeholder="Cari Data..." 
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="keys-list">
              <div v-if="inspectorStore.loading && !inspectorStore.keys.length" class="loading-state">
                <div class="spinner-sm"></div>
                <span>Memuat keys...</span>
              </div>
              
              <div v-else-if="inspectorStore.filteredKeys.length === 0" class="empty-state">
                <span>Tidak ada data ditemukan</span>
              </div>
              
              <button 
                v-for="key in inspectorStore.filteredKeys" 
                :key="key"
                @click="handleSelectKey(key)"
                class="key-item"
                :class="{ 'active': inspectorStore.selectedKey === key }"
              >
                <span class="key-text">{{ key }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <!-- Right Panel: Preview -->
          <div class="inspector-preview">
            <div class="preview-header">
              <h3 class="preview-title">
                <span v-if="inspectorStore.selectedKey">{{ inspectorStore.selectedKey }}</span>
                <span v-else class="placeholder-title">Data Inspector</span>
              </h3>
              <div v-if="inspectorStore.selectedKey" class="actions">
                <button @click="handleRefresh" class="action-btn" title="Refresh Data">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </div>
            </div>

            <div class="preview-body">
              <div v-if="inspectorStore.loading && inspectorStore.selectedKey" class="loading-overlay">
                <div class="spinner"></div>
                <p>Mengambil data...</p>
              </div>

              <div v-else-if="inspectorStore.jsonData" class="json-viewer">
                <pre><code>{{ JSON.stringify(inspectorStore.jsonData, null, 2) }}</code></pre>
              </div>

              <div v-else class="empty-preview">
                <div class="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <h3>Pilih data di sidebar</h3>
                <p>Pilih salah satu key cache di sebelah kiri untuk melihat detail data JSON.</p>
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

const handleSearch = () => {
  inspectorStore.filterKeys(searchQuery.value);
};

const handleSelectKey = (key) => {
  inspectorStore.selectKey(key);
};

const handleRefresh = () => {
  if (inspectorStore.selectedKey) {
    inspectorStore.selectKey(inspectorStore.selectedKey);
  }
};

onMounted(() => {
  inspectorStore.fetchKeys();
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

.keys-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.key-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.key-item:hover {
  background-color: #f1f5f9;
}

.key-item.active {
  background-color: #eff6ff; /* bg-blue-50 */
  color: #21308f;
  font-weight: 500;
  border-left: 4px solid #21308f;
  border-radius: 4px 8px 8px 4px;
}

.key-text {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.key-item.active .chevron-icon {
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

.json-viewer {
  height: 100%;
  overflow: auto;
  padding: 24px;
  background-color: #1e293b; /* Slate-800 */
}

.json-viewer pre {
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #e2e8f0;
  line-height: 1.5;
}

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
