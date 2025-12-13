<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dashboardService } from '@/api/dashboard.service';
import type { DashboardStatsResponse } from '@/types/dashboard.types';

// Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  BookOpen,
  ScrollText,
  Activity,
  Clock,
  RotateCw,
} from 'lucide-vue-next';

const isLoading = ref(false);
const stats = ref<DashboardStatsResponse | null>(null);
const lastUpdated = ref<Date>(new Date());

// Format Angka (misal: 1200 -> 1.200)
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

// Format Tanggal
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
};

// Fetch Data Function
const fetchStats = async () => {
  isLoading.value = true;
  try {
    const data = await dashboardService.getStats();
    stats.value = data;
    lastUpdated.value = new Date();
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p class="text-muted-foreground">
          Ringkasan kesehatan sistem DataCore & statistik data.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground hidden md:inline">
          Diperbarui: {{ formatDate(lastUpdated.toISOString()) }}
        </span>
        <Button
          variant="outline"
          size="sm"
          @click="fetchStats"
          :disabled="isLoading"
        >
          <RotateCw
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': isLoading }"
          />
          Refresh
        </Button>
      </div>
    </div>

    <div
      v-if="!stats && isLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        class="h-32 bg-muted rounded-xl animate-pulse"
        v-for="i in 4"
        :key="i"
      ></div>
    </div>

    <div v-else-if="stats" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          class="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Total Mahasiswa
            </CardTitle>
            <Users class="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ formatNumber(stats.data.totalMahasiswa) }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">Data profil aktif</p>
          </CardContent>
        </Card>

        <Card
          class="border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Total Dosen
            </CardTitle>
            <GraduationCap class="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ formatNumber(stats.data.totalDosen) }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">Data pengajar</p>
          </CardContent>
        </Card>

        <Card
          class="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Rekam Nilai
            </CardTitle>
            <BookOpen class="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ formatNumber(stats.data.totalDataAkademikNilai) }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              Detail Nilai Mata Kuliah
            </p>
          </CardContent>
        </Card>

        <Card
          class="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Rekam IP Semester
            </CardTitle>
            <ScrollText class="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ formatNumber(stats.data.totalDataAkademikIp) }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">Riwayat IPS & IPK</p>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Activity class="h-5 w-5 text-blue-500" />
              Status Antrian (Queue)
            </CardTitle>
            <CardDescription
              >Kondisi pemrosesan background job BullMQ</CardDescription
            >
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span
                  class="block text-2xl font-bold text-blue-600 dark:text-blue-400"
                >
                  {{ stats.queue.active }}
                </span>
                <span class="text-xs text-muted-foreground font-medium"
                  >Active</span
                >
              </div>
              <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span
                  class="block text-2xl font-bold text-orange-600 dark:text-orange-400"
                >
                  {{ stats.queue.waiting }}
                </span>
                <span class="text-xs text-muted-foreground font-medium"
                  >Waiting</span
                >
              </div>
              <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span
                  class="block text-2xl font-bold text-red-600 dark:text-red-400"
                >
                  {{ stats.queue.failed }}
                </span>
                <span class="text-xs text-muted-foreground font-medium"
                  >Failed</span
                >
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5 text-purple-500" />
              Sinkronisasi Terakhir
            </CardTitle>
            <CardDescription
              >Riwayat eksekusi job terakhir kali</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <span class="text-sm font-medium text-muted-foreground"
                >Status</span
              >
              <div class="flex items-center gap-2">
                <span
                  class="uppercase text-xs font-bold px-2 py-1 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                      stats.lastSync.status === 'success',
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                      stats.lastSync.status === 'failed',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
                      stats.lastSync.status === 'running' ||
                      stats.lastSync.status === 'pending',
                  }"
                >
                  {{ stats.lastSync.status || 'UNKNOWN' }}
                </span>
              </div>
            </div>

            <div
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <span class="text-sm font-medium text-muted-foreground"
                >Waktu Selesai</span
              >
              <span class="text-sm text-foreground font-medium">
                {{ formatDate(stats.lastSync.finishedAt) }}
              </span>
            </div>

            <div
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <span class="text-sm font-medium text-muted-foreground"
                >Durasi</span
              >
              <span class="text-sm text-foreground font-medium">
                {{ stats.lastSync.duration || '-' }}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
