<template>
  <div class="layout-wrapper">
    <AppSidebar />
    
    <div class="main-content">
      <AppHeader />
      
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">ETL Job Runner</h1>
          <p class="page-subtitle">Eksekusi manual proses ETL dan pantau riwayat sinkronisasi data.</p>
        </div>

        <div class="job-runner-grid">
          <!-- Run Job Card (Trigger) -->
          <div class="job-card trigger-card">
            <div class="card-header">
              <h3>Jalankan Job Baru</h3>
            </div>
            
            <div class="card-body">
              <div class="form-group">
                <label for="job-select">Pilih Job</label>
                <div class="select-wrapper">
                  <select id="job-select" v-model="selectedJob" class="form-select">
                    <option value="" disabled>-- Pilih Job --</option>
                    <option value="full-sync-and-aggregate">Full Sync & Agregasi (Mahasiswa & Akademik)</option>
                    <option value="sync-mahasiswa">Sync Data Mahasiswa Saja</option>
                    <option value="aggregate-guest">Hitung Ulang Cache Guest (Public)</option>
                  </select>
                  <div class="select-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>

              <transition name="fade">
                <div v-if="jobStore.success" class="alert alert-success">
                  <div class="alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <span>{{ jobStore.success }}</span>
                </div>
              </transition>

              <transition name="fade">
                <div v-if="jobStore.error" class="alert alert-error">
                  <div class="alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <span>{{ jobStore.error }}</span>
                </div>
              </transition>

              <button 
                @click="handleRunJob" 
                :disabled="!selectedJob || jobStore.loading" 
                class="btn-primary"
                :class="{ 'btn-loading': jobStore.loading }"
              >
                <span v-if="jobStore.loading" class="spinner"></span>
                <span>{{ jobStore.loading ? 'Processing...' : 'Jalankan Job' }}</span>
              </button>
            </div>
          </div>

          <!-- Job History Card -->
          <div class="job-card history-card">
            <div class="card-header">
              <h3>Riwayat Eksekusi</h3>
              <button @click="jobStore.fetchHistory()" class="btn-refresh" title="Refresh History">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              </button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="history-table">
                  <thead>
                    <tr>
                      <th>Job Name</th>
                      <th>Status</th>
                      <th>Trigger</th>
                      <th>Waktu Mulai</th>
                      <th>Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="jobStore.historyLoading">
                      <td colspan="5" class="text-center py-8">
                        <div class="loading-state">
                          <div class="spinner-blue"></div>
                          <p>Memuat riwayat...</p>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="jobStore.history.length === 0">
                      <td colspan="5" class="text-center py-8 text-gray-500">Belum ada riwayat eksekusi.</td>
                    </tr>
                    <tr v-else v-for="job in jobStore.history" :key="job.id" class="table-row">
                      <td class="font-medium">{{ job.jobName }}</td>
                      <td>
                        <span :class="['badge', getStatusClass(job.status)]">
                          {{ job.status }}
                        </span>
                      </td>
                      <td class="text-gray-600">{{ job.trigger || 'Manual' }}</td>
                      <td class="text-gray-600">{{ formatDate(job.startTime) }}</td>
                      <td class="text-gray-600 font-mono">{{ formatDuration(job.duration) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="pagination-controls" v-if="jobStore.pagination.lastPage > 1">
                <button 
                  @click="changePage(jobStore.pagination.currentPage - 1)"
                  :disabled="jobStore.pagination.currentPage === 1"
                  class="btn-pagination"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  Previous
                </button>
                <span class="page-info">
                  Page <strong>{{ jobStore.pagination.currentPage }}</strong> of {{ jobStore.pagination.lastPage }}
                </span>
                <button 
                  @click="changePage(jobStore.pagination.currentPage + 1)"
                  :disabled="jobStore.pagination.currentPage === jobStore.pagination.lastPage"
                  class="btn-pagination"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
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
import AppSidebar from '@/components/Layout/AppSidebar.vue';
import AppHeader from '@/components/Layout/AppHeader.vue';
import { useJobStore } from '@/stores/job';

const jobStore = useJobStore();
const selectedJob = ref('');

onMounted(() => {
  jobStore.fetchHistory();
});

const handleRunJob = () => {
  if (selectedJob.value) {
    jobStore.triggerJob(selectedJob.value);
  }
};

const changePage = (page) => {
  jobStore.fetchHistory(page);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '-';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const getStatusClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'badge-success';
    case 'FAILED': return 'badge-error';
    case 'RUNNING': return 'badge-running';
    default: return 'badge-default';
  }
};
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
}

.content-body {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  font-size: 1rem;
}

/* Grid Layout */
.job-runner-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .job-runner-grid {
    grid-template-columns: 350px 1fr;
    align-items: start;
  }
}

/* Cards */
.job-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #21308f;
}

.card-body {
  padding: 1.5rem;
}

.card-body.p-0 {
  padding: 0;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
  font-size: 0.95rem;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #1e293b;
  background-color: #fff;
  transition: all 0.2s;
  appearance: none;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #21308f;
  box-shadow: 0 0 0 3px rgba(33, 48, 143, 0.1);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background-color: #21308f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1a2675;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 48, 143, 0.2);
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-refresh {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-refresh:hover {
  background-color: #f1f5f9;
  color: #21308f;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-error {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.history-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.history-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
  vertical-align: middle;
}

.table-row:hover td {
  background-color: #f8fafc;
}

.table-row:last-child td {
  border-bottom: none;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-success {
  background-color: #dcfce7;
  color: #15803d;
}

.badge-error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.badge-running {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.badge-default {
  background-color: #f1f5f9;
  color: #475569;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #fff;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 0.375rem;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  color: #21308f;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f1f5f9;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

/* Loading Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.spinner-blue {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #21308f;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Utilities */
.text-center { text-align: center; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.text-gray-500 { color: #64748b; }
.text-gray-600 { color: #475569; }
.font-medium { font-weight: 500; }
.font-mono { font-family: 'Roboto Mono', monospace; font-size: 0.85rem; }
</style>
