<template>
  <div class="layout-wrapper">
    <AppSidebar />
    
    <div class="main-content">
      <AppHeader />
      
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Kelola preferensi aplikasi dan profil pengguna.</p>
        </div>

        <div class="settings-container">
          <!-- User Profile Section -->
          <div class="settings-card">
            <div class="card-header">
              <h3>Profil Pengguna</h3>
            </div>
            <div class="card-body">
              <div class="profile-info">
                <div class="avatar-placeholder">
                  <span>AD</span>
                </div>
                <div class="user-details">
                  <h4 class="user-name">Admin DataCore</h4>
                  <p class="user-role">Super Administrator</p>
                  <p class="user-email">admin@polban.ac.id</p>
                </div>
              </div>
              <div class="action-buttons">
                <button class="btn-outline">Edit Profil</button>
                <button class="btn-outline">Ubah Password</button>
              </div>
            </div>
          </div>

          <!-- App Settings Section -->
          <div class="settings-card">
            <div class="card-header">
              <h3>Pengaturan Aplikasi</h3>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-label">
                  <h4>Notifikasi Email</h4>
                  <p>Terima laporan status job via email.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" checked>
                  <span class="slider round"></span>
                </label>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>Mode Gelap</h4>
                  <p>Aktifkan tampilan gelap untuk antarmuka.</p>
                </div>
                <label class="switch">
                  <input type="checkbox">
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-label">
                  <h4>Auto-Refresh Dashboard</h4>
                  <p>Perbarui data dashboard setiap 5 menit.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" checked>
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/Layout/AppSidebar.vue';
import AppHeader from '@/components/Layout/AppHeader.vue';
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
  margin-left: 280px; /* Matches sidebar width */
}

.content-body {
  padding: 2rem;
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

.settings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.settings-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #fff;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #21308f; /* Primary Color */
}

.card-body {
  padding: 1.5rem;
}

/* Profile Styles */
.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #21308f 0%, #4a5ecf 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(33, 48, 143, 0.2);
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.user-email {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-outline {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-outline:hover {
  border-color: #21308f;
  color: #21308f;
  background-color: #f8fafc;
}

/* Toggle Switch Styles */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #334155;
}

.setting-label p {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #21308f;
}

input:focus + .slider {
  box-shadow: 0 0 1px #21308f;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
