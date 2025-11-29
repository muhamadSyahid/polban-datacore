<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Logo or Title requested in prompt -->
      <div class="header-brand">
        <span class="brand-text">DataCore Panel</span>
      </div>
    </div>
    <div class="header-right">
      <div class="user-profile">
        <div class="user-info">
          <span class="username">{{ authStore.user?.username || 'User' }}</span>
          <span class="role">Administrator</span>
        </div>
        <div class="avatar">
          {{ getUserInitials() }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const getUserInitials = () => {
  const name = authStore.user?.username || authStore.user?.email || 'U';
  return name.substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.app-header {
  height: 70px;
  background-color: #21308f; /* Primary Blue */
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}

.header-left {
  display: flex;
  align-items: center;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
}

.role {
  font-size: 0.75rem;
  opacity: 0.8;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}
</style>
