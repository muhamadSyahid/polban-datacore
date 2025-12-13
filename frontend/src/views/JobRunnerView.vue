<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner'; // Notification
import { jobsService } from '@/api/jobs.service';
import type { JobLog, JobSchedule } from '@/types/job.types';

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Play,
  History,
  CalendarClock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-vue-next';

// --- STATE: JOB RUNNER ---
const logs = ref<JobLog[]>([]);
const isLoadingLogs = ref(false);
const pagination = ref({ page: 1, lastPage: 1, total: 0 });
const isRunningJob = ref(false);

// --- STATE: SCHEDULER ---
const schedules = ref<JobSchedule[]>([]);
const isLoadingSchedules = ref(false);
const selectedSchedule = ref<JobSchedule | null>(null); // For Edit Dialog
const isEditDialogOpen = ref(false);
const isUpdatingSchedule = ref(false);
const editForm = ref({ cron: '', description: '' });

// --- FORMATTERS ---
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-500 hover:bg-green-600';
    case 'failed':
      return 'destructive'; // Shadcn destructive variant
    case 'running':
      return 'bg-blue-500 hover:bg-blue-600 animate-pulse';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

// --- ACTIONS: RUNNER ---
const fetchLogs = async (page = 1) => {
  isLoadingLogs.value = true;
  try {
    const res = await jobsService.getHistory(page);
    logs.value = res.data;
    pagination.value = {
      page: res.meta.page,
      lastPage: res.meta.lastPage,
      total: res.meta.total,
    };
  } catch (err) {
    toast.error('Gagal memuat riwayat job');
  } finally {
    isLoadingLogs.value = false;
  }
};

const triggerJob = async (jobName = 'full-sync-and-aggregate') => {
  isRunningJob.value = true;
  try {
    const res = await jobsService.runJob(jobName);
    toast.success('Job Berhasil Dipicu', {
      description: `Queue ID: ${res.queueId}`,
    });
    // Auto refresh logs after 2 seconds
    setTimeout(() => fetchLogs(1), 2000);
  } catch (err: any) {
    toast.error('Gagal memicu job', {
      description: err.response?.data?.message || 'Server Error',
    });
  } finally {
    isRunningJob.value = false;
  }
};

// --- ACTIONS: SCHEDULER ---
const fetchSchedules = async () => {
  isLoadingSchedules.value = true;
  try {
    const res = await jobsService.getSchedules();
    schedules.value = res.data;
  } catch (err) {
    toast.error('Gagal memuat jadwal');
  } finally {
    isLoadingSchedules.value = false;
  }
};

const openEditDialog = (schedule: JobSchedule) => {
  selectedSchedule.value = schedule;
  editForm.value = {
    cron: schedule.cronExpression,
    description: schedule.description || '',
  };
  isEditDialogOpen.value = true;
};

const saveSchedule = async () => {
  if (!selectedSchedule.value) return;

  isUpdatingSchedule.value = true;
  try {
    await jobsService.updateSchedule({
      jobName: selectedSchedule.value.jobName,
      cronExpression: editForm.value.cron,
      description: editForm.value.description,
    });
    toast.success('Jadwal Berhasil Diupdate');
    isEditDialogOpen.value = false;
    fetchSchedules();
  } catch (err: any) {
    toast.error('Gagal update jadwal', {
      description:
        err.response?.data?.message || 'Pastikan Cron Expression Valid',
    });
  } finally {
    isUpdatingSchedule.value = false;
  }
};

onMounted(() => {
  fetchLogs();
  fetchSchedules();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Job Runner
        </h1>
        <p class="text-muted-foreground">
          Orkestrasi sinkronisasi data (ETL) dan penjadwalan.
        </p>
      </div>
      <Button
        @click="triggerJob()"
        :disabled="isRunningJob"
        class="shadow-lg shadow-primary/20"
      >
        <Play class="w-4 h-4 mr-2" :class="{ hidden: isRunningJob }" />
        <Loader2 v-if="isRunningJob" class="w-4 h-4 mr-2 animate-spin" />
        {{ isRunningJob ? 'Queueing...' : 'Trigger Full Sync' }}
      </Button>
    </div>

    <Tabs default-value="history" class="w-full">
      <TabsList class="mb-4">
        <TabsTrigger value="history" class="flex items-center gap-2">
          <History class="w-4 h-4" /> Riwayat Eksekusi
        </TabsTrigger>
        <TabsTrigger value="schedule" class="flex items-center gap-2">
          <CalendarClock class="w-4 h-4" /> Penjadwalan (Cron)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Log Eksekusi</CardTitle>
                <CardDescription
                  >Daftar riwayat job yang telah dijalankan.</CardDescription
                >
              </div>
              <Button
                variant="outline"
                size="icon"
                @click="fetchLogs(pagination.page)"
                :disabled="isLoadingLogs"
              >
                <RefreshCw
                  class="w-4 h-4"
                  :class="{ 'animate-spin': isLoadingLogs }"
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu Mulai</TableHead>
                    <TableHead>Durasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="isLoadingLogs">
                    <TableCell
                      colspan="5"
                      class="h-24 text-center text-muted-foreground"
                      >Memuat data...</TableCell
                    >
                  </TableRow>
                  <TableRow v-else-if="logs.length === 0">
                    <TableCell
                      colspan="5"
                      class="h-24 text-center text-muted-foreground"
                      >Belum ada riwayat job.</TableCell
                    >
                  </TableRow>
                  <TableRow v-for="log in logs" :key="log.id">
                    <TableCell class="font-medium">{{ log.jobName }}</TableCell>
                    <TableCell>
                      <Badge variant="outline" class="capitalize">{{
                        log.triggeredBy
                      }}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge :class="getStatusBadge(log.status)">{{
                        log.status
                      }}</Badge>
                      <div
                        v-if="log.status === 'failed'"
                        class="text-xs text-red-500 mt-1 max-w-50 truncate"
                        :title="log.logMessage"
                      >
                        {{ log.logMessage }}
                      </div>
                    </TableCell>
                    <TableCell class="text-xs">{{
                      formatDate(log.startTime)
                    }}</TableCell>
                    <TableCell class="text-xs">{{
                      log.duration || '-'
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div class="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                :disabled="pagination.page <= 1 || isLoadingLogs"
                @click="fetchLogs(pagination.page - 1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </Button>
              <div class="text-sm font-medium">
                Page {{ pagination.page }} of
                {{ pagination.lastPage }}
              </div>
              <Button
                variant="outline"
                size="sm"
                :disabled="
                  pagination.page >= pagination.lastPage || isLoadingLogs
                "
                @click="fetchLogs(pagination.page + 1)"
              >
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Jadwal Otomatis</CardTitle>
                <CardDescription
                  >Konfigurasi Cron Job untuk sinkronisasi
                  otomatis.</CardDescription
                >
              </div>
              <Button
                variant="outline"
                size="icon"
                @click="fetchSchedules"
                :disabled="isLoadingSchedules"
              >
                <RefreshCw
                  class="w-4 h-4"
                  :class="{
                    'animate-spin': isLoadingSchedules,
                  }"
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Cron Expression</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="sch in schedules" :key="sch.id">
                    <TableCell class="font-medium">{{ sch.jobName }}</TableCell>
                    <TableCell>
                      <code
                        class="bg-muted px-2 py-1 rounded text-sm font-mono"
                        >{{ sch.cronExpression }}</code
                      >
                    </TableCell>
                    <TableCell>{{ sch.description || '-' }}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="openEditDialog(sch)"
                        >Edit</Button
                      >
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog v-model:open="isEditDialogOpen">
      <DialogContent class="sm:max-w-125">
        <DialogHeader>
          <DialogTitle
            >Edit Jadwal: {{ selectedSchedule?.jobName }}</DialogTitle
          >
          <DialogDescription>
            Ubah konfigurasi waktu eksekusi job ini.
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-6 py-4">
          <div class="grid gap-2">
            <Label for="cron">Cron Expression</Label>
            <Input
              id="cron"
              v-model="editForm.cron"
              class="font-mono"
              placeholder="* * * * *"
            />
            <p class="text-[0.8rem] text-muted-foreground">
              Contoh: <code>0 0 * * *</code> (Setiap tengah malam),
              <code>*/30 * * * *</code> (Tiap 30 menit).
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="desc">Deskripsi</Label>
            <Textarea
              id="desc"
              v-model="editForm.description"
              class="resize-none"
              rows="3"
              placeholder="Jelaskan tujuan jadwal ini..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isEditDialogOpen = false"
            >Batal</Button
          >
          <Button @click="saveSchedule" :disabled="isUpdatingSchedule">
            <Loader2
              v-if="isUpdatingSchedule"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
