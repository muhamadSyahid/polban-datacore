<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../api/auth.service';
import { AxiosError } from 'axios';

// Import Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-vue-next';

const appVersion = import.meta.env.VITE_APP_VERSION;

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  // Reset state
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 1. Panggil API Login
    const response = await authService.login({
      email: email.value,
      password: password.value,
    });

    // 2. Simpan ke Pinia (State & LocalStorage)
    authStore.setAuth(response.token, response.user);

    // 3. Redirect ke Dashboard
    router.push('/');
  } catch (error: any) {
    console.error('Login Failed:', error);

    // Handle Error Message dari Backend
    if (error instanceof AxiosError && error.response) {
      // Mengambil pesan error dari response backend (jika ada)
      errorMessage.value =
        error.response.data.message || 'Email atau password salah.';
    } else {
      errorMessage.value = 'Terjadi kesalahan jaringan. Coba lagi nanti.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4"
  >
    <Card class="w-full max-w-md shadow-lg border-t-4 border-t-primary">
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-2xl font-bold text-primary">
          Polban DataCore
        </CardTitle>
        <CardDescription> Masuk untuk mengelola agregasi data </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <Alert v-if="errorMessage" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Gagal Masuk</AlertTitle>
            <AlertDescription>
              {{ errorMessage }}
            </AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="email">Email Admin</Label>
            <Input
              id="email"
              type="email"
              placeholder="xxx@polban.ac.id"
              v-model="email"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              v-model="password"
              placeholder="password"
              required
              :disabled="isLoading"
            />
          </div>

          <Button
            type="submit"
            class="w-full font-semibold"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Memproses...' : 'Masuk Dashboard' }}
          </Button>
        </form>
      </CardContent>

      <CardFooter
        class="flex flex-col space-y-2 text-center text-xs text-muted-foreground"
      >
        <p>Politeknik Negeri Bandung &copy; 2025</p>
        <p>Polban DataCore {{ appVersion }}</p>
      </CardFooter>
    </Card>
  </div>
</template>
