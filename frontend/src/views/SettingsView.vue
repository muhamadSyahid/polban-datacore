<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { isDark, toggleDark } from '@/composables/useTheme';

// Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Sun, FileText, LogOut, ShieldAlert } from 'lucide-vue-next';

const auth = useAuthStore();
const appVersion = import.meta.env.VITE_APP_VERSION;
const apiDocsUrl = import.meta.env.VITE_API_DOCS_URL;

// Initials for Avatar
const initials = auth.user?.email?.substring(0, 2).toUpperCase() || 'AD';

// Handle Logout
const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    auth.logout();
  }
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-10">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Pengaturan
      </h1>
      <p class="text-muted-foreground">
        Kelola preferensi akun dan konfigurasi aplikasi.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <User class="w-5 h-5" /> Profil Pengguna
        </CardTitle>
        <CardDescription
          >Informasi akun administrator yang sedang aktif.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex items-center gap-6">
          <Avatar class="h-20 w-20 border-4 border-muted">
            <AvatarImage src="" />
            <AvatarFallback class="text-2xl text-primary font-bold">
              {{ initials }}
            </AvatarFallback>
          </Avatar>

          <div class="space-y-1">
            <h3 class="text-lg font-medium">
              {{ auth.user?.name || 'Administrator' }}
            </h3>
            <p class="text-sm text-muted-foreground">ID: {{ auth.user?.id }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span
                class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {{ auth.user?.role }}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <Label>Email</Label>
            <Input :model-value="auth.user?.email" readonly class="bg-muted" />
          </div>
          <div class="grid gap-2">
            <Label>Role System</Label>
            <Input :model-value="auth.user?.role" readonly class="bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Sun class="w-5 h-5" /> Tampilan Aplikasi
        </CardTitle>
        <CardDescription>Sesuaikan tema antarmuka dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between rounded-lg border p-4">
          <div class="space-y-0.5">
            <Label class="text-base">Mode Gelap (Dark Mode)</Label>
            <p class="text-sm text-muted-foreground">
              Mengubah tampilan menjadi warna gelap untuk kenyamanan mata.
            </p>
          </div>
          <Switch @click="toggleDark()" v-model="isDark" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <FileText class="w-5 h-5" /> Dokumentasi & Versi
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div
          class="flex items-center justify-between p-4 border rounded-lg bg-accent/20"
        >
          <div class="space-y-1">
            <p class="font-medium">Dokumentasi API (Swagger/OpenAPI)</p>
            <p class="text-sm text-muted-foreground">
              Panduan integrasi endpoint backend DataCore.
            </p>
          </div>
          <Button variant="outline" as-child>
            <a :href="apiDocsUrl" target="_blank" rel="noopener noreferrer">
              Buka Docs
            </a>
          </Button>
        </div>

        <div class="flex items-center justify-between px-4 py-2">
          <span class="text-sm text-muted-foreground">Versi Aplikasi</span>
          <span class="font-mono text-sm font-bold">{{ appVersion }}</span>
        </div>
      </CardContent>
    </Card>

    <Card class="border-red-200 dark:border-red-900/50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-destructive">
          <ShieldAlert class="w-5 h-5" /> Zona Bahaya
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">
            Keluar dari sesi administrator saat ini. Anda perlu login kembali
            untuk mengakses dashboard.
          </p>
          <Button variant="destructive" @click="handleLogout">
            <LogOut class="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
