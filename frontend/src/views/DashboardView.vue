<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome to the protected dashboard!</p>
    <div class="user-info" v-if="authStore.user">
      <p>Logged in as: {{ authStore.user.username || authStore.user.email }}</p>
    </div>
    <button @click="handleLogout" class="logout-btn">Logout</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
  text-align: center;
}
.logout-btn {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}
.logout-btn:hover {
  background-color: #c82333;
}
</style>
