<template>
  <div class="layout-wrapper">
    <AppSidebar />
    
    <div class="main-content">
      <AppHeader />
      
      <div class="content-body">
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <h1 class="welcome-title">Selamat Datang di DataCore Panel</h1>
          <p class="welcome-subtitle">Monitor integrasi data Polban Dataverse secara real-time.</p>
        </div>

        <!-- Loading State -->
        <div v-if="dashboardStore.loading && !dashboardStore.stats" class="state-container">
          <div class="spinner"></div>
          <p>Memuat data statistik...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="dashboardStore.error" class="state-container error">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p>{{ dashboardStore.error }}</p>
          <button @click="dashboardStore.fetchStats()" class="retry-btn">Coba Lagi</button>
        </div>

        <!-- Stats Grid -->
        <div v-else class="stats-grid">
          <!-- Card 1: Total Mahasiswa -->
          <div class="stat-card">
            <div class="card-content">
              <div class="text-content">
                <p class="card-label">Total Mahasiswa</p>
                <h3 class="card-value">{{ dashboardStore.studentCount ?? '-' }}</h3>
                <p class="card-subtext">Data Terintegrasi</p>
              </div>
              <div class="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
            </div>
          </div>

          <!-- Card 2: Total Dosen -->
          <div class="stat-card">
            <div class="card-content">
              <div class="text-content">
                <p class="card-label">Total Dosen</p>
                <h3 class="card-value">{{ dashboardStore.lecturerCount ?? '-' }}</h3>
                <p class="card-subtext">Data Terintegrasi</p>
              </div>
              <div class="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
            </div>
          </div>

          <!-- Card 3: Antrian Job -->
          <div class="stat-card">
            <div class="card-content">
              <div class="text-content">
                <p class="card-label">Antrian Job</p>
                <div class="value-group">
                  <h3 class="card-value">{{ dashboardStore.activeQueue }}</h3>
                  <span v-if="dashboardStore.failedQueue > 0" class="badge-failed-mini">
                    {{ dashboardStore.failedQueue }} Failed
                  </span>
                </div>
                <p class="card-subtext">Active & Waiting</p>
              </div>
              <div class="icon-box secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
            </div>
          </div>

          <!-- Card 4: Status Sinkronisasi -->
          <div class="stat-card">
            <div class="card-content">
              <div class="text-content">
                <p class="card-label">Status Sinkronisasi</p>
                <div class="status-badge-wrapper">
                  <span class="status-badge" :class="getStatusClass(dashboardStore.syncStatus)">
                    {{ dashboardStore.syncStatus || 'UNKNOWN' }}
                  </span>
                </div>
                <p class="card-subtext">
                  {{ formatRelativeTime(dashboardStore.lastSyncTime) }}
                </p>
              </div>
              <div class="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import AppSidebar from '@/components/Layout/AppSidebar.vue';
import AppHeader from '@/components/Layout/AppHeader.vue';

const dashboardStore = useDashboardStore();
let pollingInterval = null;

const getStatusClass = (status) => {
  if (!status) return 'status-unknown';
  const s = status.toLowerCase();
  if (s === 'success') return 'status-success';
  if (s === 'failed') return 'status-failed';
  if (s === 'pending' || s === 'running') return 'status-pending';
  return 'status-unknown';
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
};

onMounted(() => {
  dashboardStore.fetchStats();
  pollingInterval = setInterval(() => {
    dashboardStore.fetchStats();
  }, 10000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<style scoped>
:root {
  --color-primary: #21308f;
  --color-primary-light: #3a4dc6;
  --color-secondary: #f6983e;
  --color-secondary-dark: #de8836;
  --color-neutral-bg: #f8fafc;
  --color-text-primary: #21308f;
  --color-text-secondary: #64748b;
  --radius-card: 0.75rem; /* 12px */
  --radius-icon: 1rem; /* 16px */
}

.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc; /* Neutral Bg */
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 280px; /* Sidebar width */
  display: flex;
  flex-direction: column;
}

.content-body {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Welcome Banner */
.welcome-banner {
  background-color: #21308f; /* Primary */
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(33, 48, 143, 0.2);
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem; /* 24px */
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Stat Card */
.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px; /* Radius 12px */
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-content {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b; /* Gray-500 */
  margin: 0 0 4px 0;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #21308f; /* Primary */
  margin: 0;
  line-height: 1.2;
}

.card-subtext {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* Icon Box */
.icon-box {
  width: 65px;
  height: 65px;
  background-color: #21308f; /* Primary */
  border-radius: 1rem; /* 16px */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  margin-left: 16px;
  box-shadow: 0 4px 6px -1px rgba(33, 48, 143, 0.3);
}

.icon-box.secondary {
  background-color: #f6983e; /* Secondary */
  box-shadow: 0 4px 6px -1px rgba(246, 152, 62, 0.3);
}

/* Badges & Status */
.status-badge-wrapper {
  margin: 4px 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-success {
  background-color: #dcfce7;
  color: #15803d;
}

.status-failed {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-pending {
  background-color: #fef3c7;
  color: #b45309;
}

.status-unknown {
  background-color: #f1f5f9;
  color: #64748b;
}

.badge-failed-mini {
  font-size: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 2px 8px;
  border-radius: 6px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: 600;
}

.value-group {
  display: flex;
  align-items: center;
}

/* Loading & Error States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #21308f;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background-color: #21308f;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background-color: #3a4dc6;
}
</style>