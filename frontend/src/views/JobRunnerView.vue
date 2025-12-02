<template>
  <div class="layout-wrapper">
    <AppSidebar />
    
    <div class="main-content">
      <AppHeader />
      
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">Job Runner</h1>
          <p class="page-subtitle">Eksekusi manual proses ETL dan sinkronisasi data.</p>
        </div>

        <div class="job-runner-container">
          <!-- Run Job Card -->
          <div class="job-card">
            <div class="card-header">
              <h3>Jalankan Job Baru</h3>
            </div>
            
            <div class="card-body">
              <div class="form-group">
                <label for="job-select">Pilih Job</label>
                <select id="job-select" v-model="selectedJob" class="form-select">
                  <option value="" disabled>-- Pilih Job --</option>
                  <option value="full-sync-and-aggregate">Full Sync & Agregasi (Mahasiswa & Akademik)</option>
                  <option value="sync-mahasiswa">Sync Data Mahasiswa Saja</option>
                  <option value="aggregate-guest">Hitung Ulang Cache Guest (Public)</option>
                </select>
              </div>

              <div v-if="jobStore.success" class="alert alert-success">
                {{ jobStore.success }}
              </div>

              <div v-if="jobStore.error" class="alert alert-error">
                {{ jobStore.error }}
              </div>

              <button 
                @click="handleRunJob" 
                :disabled="!selectedJob || jobStore.loading" 
                class="btn-primary"
              >
                {{ jobStore.loading ? 'Processing...' : 'Jalankan Job' }}
              </button>
            </div>
          </div>

          <!-- Job History Card -->
          <div class="job-card history-card">
            <div class="card-header">
              <h3>Riwayat Eksekusi</h3>
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
                      <td colspan="5" class="text-center">Memuat riwayat...</td>
                    </tr>
                    <tr v-else-if="jobStore.history.length === 0">
                      <td colspan="5" class="text-center">Belum ada riwayat eksekusi.</td>
                    </tr>
                    <tr v-else v-for="job in jobStore.history" :key="job.id">
                      <td>{{ job.jobName }}</td>
                      <td>
                        <span :class="['badge', getStatusClass(job.status)]">
                          {{ job.status }}
                        </span>
                      </td>
                      <td>{{ job.trigger || 'Manual' }}</td>
                      <td>{{ formatDate(job.startTime) }}</td>
                      <td>{{ formatDuration(job.duration) }}</td>
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
                  Previous
                </button>
                <span class="page-info">
                  Page {{ jobStore.pagination.currentPage }} of {{ jobStore.pagination.lastPage }}
                </span>
                <button 
                  @click="changePage(jobStore.pagination.currentPage + 1)"
                  :disabled="jobStore.pagination.currentPage === jobStore.pagination.lastPage"
                  class="btn-pagination"
                >
                  Next
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
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
}

.content-body {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  font-size: 0.95rem;
}

.job-runner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  min-height: 50vh;
  padding-top: 2rem;
}

.job-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 800px; /* Increased width for table */
  overflow: hidden;
}

.history-card {
  margin-bottom: 2rem;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-body {
  padding: 1.5rem;
}

.card-body.p-0 {
  padding: 0;
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
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.history-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-size: 0.9rem;
}

.history-table tr:hover {
  background-color: #f9fafb;
}

.text-center {
  text-align: center;
}

/* Badge Styles */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-running {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-default {
  background-color: #f3f4f6;
  color: #374151;
}

/* Pagination Styles */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 0.375rem;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #2d3748;
  background-color: #fff;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary, #21308f);
  box-shadow: 0 0 0 3px rgba(33, 48, 143, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-primary, #21308f);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1a2675;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.alert-success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
