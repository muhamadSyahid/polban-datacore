<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username/Email</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          required
          placeholder="Enter username or email"
          autocomplete="username"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required
          placeholder="Enter password"
          autocomplete="current-password"
        />
      </div>
      <div v-if="authStore.error" class="error-message alert alert-danger">
        {{ authStore.error }}
      </div>
      <button type="submit" :disabled="authStore.loading" class="login-btn">
        <span v-if="authStore.loading" class="spinner"></span>
        {{ authStore.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  if (!username.value || !password.value) {
    return;
  }
  
  try {
    await authStore.login({
      username: username.value,
      password: password.value
    });
    router.push('/dashboard');
  } catch (e) {
    if (e.response) {
      if (e.response.status === 401 || e.response.status === 400) {
        authStore.error = "Username atau Password salah.";
      } else if (e.response.status === 500) {
        authStore.error = "Terjadi kesalahan internal pada server DataHub.";
      } else {
        authStore.error = e.response.data?.message || "Terjadi kesalahan saat login";
      }
    } else {
      authStore.error = "Gagal terhubung ke DataCore Backend. Periksa koneksi internet atau VPN kampus.";
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.error-message {
  color: #721c24;
  margin-bottom: 15px;
  text-align: center;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-btn:disabled {
  background-color: #a0dcb6;
  cursor: not-allowed;
}
.login-btn:hover:not(:disabled) {
  background-color: #3aa876;
}
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
