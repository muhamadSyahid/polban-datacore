<template>
  <div class="layout-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span class="logo-text">DataCore</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <a href="#" class="nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span>Dashboard</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <span>ETL Jobs</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="top-header">
        <div class="header-left">
          <h2 class="page-title">Dashboard</h2>
        </div>
        <div class="header-right">
          <div class="user-profile">
            <div class="avatar">
              {{ getUserInitials() }}
            </div>
            <div class="user-info">
              <span class="username">{{ authStore.user?.username || 'User' }}</span>
              <span class="role">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Body -->
      <div class="content-body">
        <!-- Hero Section -->
        <div class="hero-section">
          <h1 class="welcome-text">
            Selamat Datang di <span class="highlight-text">DataCore Panel</span>
          </h1>
          <p class="subtitle">Monitor integrasi data Polban Dataverse secara real-time.</p>
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
              <div>
                <p class="card-label">Total Mahasiswa</p>
                <h3 class="card-value">{{ dashboardStore.studentCount ?? '-' }}</h3>
                <p class="card-subtext">Data Terintegrasi</p>
              </div>
              <div class="card-icon-wrapper blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
            </div>
          </div>

          <!-- Card 2: Total Dosen -->
          <div class="stat-card">
            <div class="card-content">
              <div>
                <p class="card-label">Total Dosen</p>
                <h3 class="card-value">{{ dashboardStore.lecturerCount ?? '-' }}</h3>
                <p class="card-subtext">Data Terintegrasi</p>
              </div>
              <div class="card-icon-wrapper indigo">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
            </div>
          </div>

          <!-- Card 3: Antrian Job -->
          <div class="stat-card">
            <div class="card-content">
              <div>
                <p class="card-label">Antrian Job</p>
                <div class="value-group">
                  <h3 class="card-value">{{ dashboardStore.activeQueue }}</h3>
                  <span v-if="dashboardStore.failedQueue > 0" class="badge-failed-mini">
                    {{ dashboardStore.failedQueue }} Failed
                  </span>
                </div>
                <p class="card-subtext">Active & Waiting</p>
              </div>
              <div class="card-icon-wrapper amber">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
            </div>
          </div>

          <!-- Card 4: Status Sinkronisasi -->
          <div class="stat-card">
            <div class="card-content">
              <div>
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
              <div class="card-icon-wrapper green">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const router = useRouter();
let pollingInterval = null;

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const getUserInitials = () => {
  const name = authStore.user?.username || authStore.user?.email || 'U';
  return name.substring(0, 2).toUpperCase();
};

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
/* Global Layout */
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb; /* bg-gray-50 */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 256px; /* w-64 */
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb; /* border-gray-200 */
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 20;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #f3f4f6;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #2563eb; /* blue-600 */
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827; /* gray-900 */
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #6b7280; /* gray-500 */
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #f9fafb;
  color: #111827;
}

.nav-item.active {
  background-color: #eff6ff; /* bg-blue-50 */
  color: #2563eb; /* text-blue-600 */
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #f3f4f6;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: none;
  color: #ef4444; /* red-500 */
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background-color: #fef2f2; /* bg-red-50 */
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 256px; /* Sidebar width */
  display: flex;
  flex-direction: column;
}

/* Header */
.top-header {
  height: 64px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.role {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Content Body */
.content-body {
  padding: 32px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Hero Section */
.hero-section {
  margin-bottom: 32px;
}

.welcome-text {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.highlight-text {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
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
  border: 1px solid #f3f4f6;
  border-radius: 12px; /* rounded-xl */
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-subtext {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
}

.card-icon-wrapper {
  padding: 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-wrapper.blue {
  background-color: #eff6ff;
  color: #2563eb;
}

.card-icon-wrapper.indigo {
  background-color: #eef2ff;
  color: #4f46e5;
}

.card-icon-wrapper.amber {
  background-color: #fffbeb;
  color: #d97706;
}

.card-icon-wrapper.green {
  background-color: #f0fdf4;
  color: #16a34a;
}

/* Badges */
.status-badge-wrapper {
  margin: 4px 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
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
  background-color: #f3f4f6;
  color: #4b5563;
}

.badge-failed-mini {
  font-size: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
}

.value-group {
  display: flex;
  align-items: center;
}

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
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
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background-color: #1d4ed8;
}
</style>
