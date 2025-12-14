<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Play,
  History,
  CalendarClock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  List,
} from 'lucide-vue-next';

// --- STATE: JOB RUNNER ---
const logs = ref<JobLog[]>([]);
const isLoadingLogs = ref(false);
const pagination = ref({ page: 1, lastPage: 1, total: 0 });
const isRunningJob = ref(false);

// State untuk Detail Log
const selectedLog = ref<JobLog | null>(null);
const isLogDetailOpen = ref(false);

// Handler Buka Detail
const openLogDetail = (log: JobLog) => {
  selectedLog.value = log;
  isLogDetailOpen.value = true;
};

// --- STATE: SCHEDULER ---
const schedules = ref<JobSchedule[]>([]);
const availableJobs = ref<string[]>([]);
const isLoadingSchedules = ref(false);
const isDialogOpen = ref(false);
const isUpdatingSchedule = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');

// Form State
const editForm = ref({
  jobName: '',
  cron: '',
  description: '',
  isActive: true,
});

// --- ACTIONS ---

// 1. Fetch Available Jobs (Dynamic Dropdown)
const fetchAvailableJobs = async () => {
  try {
    const jobs = await jobsService.getAvailableJobs();
    availableJobs.value = jobs;
  } catch (err) {
    console.error('Failed to load available jobs');
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

// Updated: Accepts jobName argument
const triggerJob = async (jobName = 'full-sync-and-aggregate') => {
  isRunningJob.value = true;
  try {
    const res = await jobsService.runJob(jobName);
    toast.success(`Job ${jobName} Dipicu`, {
      description: `Queue ID: ${res.queueId}`,
    });
    // Auto refresh logs
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

// Toggle Active Status
const toggleScheduleStatus = async (schedule: JobSchedule, newVal: boolean) => {
  try {
    // Optimistic Update (ubah UI dulu)
    schedule.isActive = newVal;

    await jobsService.updateSchedule({
      jobName: schedule.jobName,
      isActive: newVal,
    });
    toast.success(`Jadwal ${newVal ? 'Diaktifkan' : 'Dinonaktifkan'}`);
  } catch (err) {
    // Revert jika gagal
    schedule.isActive = !newVal;
    toast.error('Gagal mengubah status jadwal');
  }
};

// Delete Schedule
const deleteSchedule = async (jobName: string) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus jadwal untuk "${jobName}"?`))
    return;

  try {
    await jobsService.deleteSchedule(jobName);
    toast.success('Jadwal berhasil dihapus');
    fetchSchedules();
  } catch (err: any) {
    toast.error('Gagal menghapus jadwal', {
      description: err.response?.data?.message || 'Error Server',
    });
  }
};

const openAddDialog = () => {
  dialogMode.value = 'create';
  editForm.value = {
    jobName: '',
    cron: '',
    description: '',
    isActive: true,
  };
  // Refresh job list saat buka dialog create
  fetchAvailableJobs();
  isDialogOpen.value = true;
};

const openEditDialog = (schedule: JobSchedule) => {
  dialogMode.value = 'edit';
  editForm.value = {
    jobName: schedule.jobName,
    cron: schedule.cronExpression,
    description: schedule.description || '',
    isActive: schedule.isActive,
  };
  isDialogOpen.value = true;
};

const saveSchedule = async () => {
  if (!editForm.value.jobName || !editForm.value.cron) {
    toast.error('Nama Job dan Cron Expression wajib diisi');
    return;
  }

  isUpdatingSchedule.value = true;
  try {
    await jobsService.updateSchedule({
      jobName: editForm.value.jobName,
      cronExpression: editForm.value.cron,
      description: editForm.value.description,
      isActive: editForm.value.isActive, // Kirim status aktif saat create/update full
    });

    toast.success(
      dialogMode.value === 'create'
        ? 'Jadwal Baru Ditambahkan'
        : 'Jadwal Berhasil Diupdate',
    );
    isDialogOpen.value = false;
    fetchSchedules();
  } catch (err: any) {
    toast.error('Gagal menyimpan jadwal', {
      description:
        err.response?.data?.message || 'Pastikan Cron Expression Valid',
    });
  } finally {
    isUpdatingSchedule.value = false;
  }
};

// Formatters
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
      return 'bg-red-500 dark:bg-red-600';
    case 'running':
      return 'bg-blue-500 hover:bg-blue-600 animate-pulse';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

onMounted(() => {
  fetchLogs();
  fetchSchedules();
  fetchAvailableJobs();
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
        @click="triggerJob('full-sync-and-aggregate')"
        :disabled="isRunningJob"
        class="shadow-lg shadow-primary/20 cursor-pointer"
      >
        <Play class="w-4 h-4 mr-2" :class="{ hidden: isRunningJob }" />
        <Loader2 v-if="isRunningJob" class="w-4 h-4 mr-2 animate-spin" />
        {{ isRunningJob ? 'Queueing...' : 'Trigger Full Sync' }}
      </Button>
    </div>

    <Tabs default-value="manual" class="w-full">
      <TabsList class="mb-4">
        <TabsTrigger
          value="manual"
          class="flex items-center gap-2 cursor-pointer"
        >
          <List class="w-4 h-4" /> Daftar Job
        </TabsTrigger>
        <TabsTrigger
          value="history"
          class="flex items-center gap-2 cursor-pointer"
        >
          <History class="w-4 h-4" /> Riwayat Eksekusi
        </TabsTrigger>
        <TabsTrigger
          value="schedule"
          class="flex items-center gap-2 cursor-pointer"
        >
          <CalendarClock class="w-4 h-4" /> Penjadwalan (Cron)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Job Tersedia</CardTitle>
                <CardDescription>
                  Semua job yang terdaftar di sistem backend dan dapat
                  dijalankan secara manual.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="fetchAvailableJobs"
                class="cursor-pointer"
              >
                <RefreshCw
                  class="w-4 h-4"
                  :class="{ 'animate-spin': isLoadingLogs }"
                />
                Refresh List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead class="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="availableJobs.length === 0">
                    <TableCell
                      colspan="3"
                      class="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada job yang ditemukan.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="jobName in availableJobs" :key="jobName">
                    <TableCell class="font-medium font-mono text-sm">
                      {{ jobName }}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" v-if="jobName.includes('sync')">
                        ETL Sync
                      </Badge>
                      <Badge
                        variant="outline"
                        v-else-if="jobName.includes('aggregate')"
                        >Aggregation</Badge
                      >
                      <Badge variant="default" v-else>Job</Badge>
                    </TableCell>
                    <TableCell class="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        class="cursor-pointer"
                        @click="triggerJob(jobName)"
                        :disabled="isRunningJob"
                      >
                        <Play class="w-4 h-4 mr-2 text-green-600" />
                        Run Manual
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Log Eksekusi</CardTitle>
                <CardDescription>
                  Daftar riwayat job yang telah dijalankan.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="fetchLogs(pagination.page)"
                :disabled="isLoadingLogs"
                class="cursor-pointer"
              >
                <RefreshCw
                  class="w-4 h-4"
                  :class="{ 'animate-spin': isLoadingLogs }"
                />
                Refresh List
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
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                  <TableRow v-else-if="logs.length === 0">
                    <TableCell
                      colspan="5"
                      class="h-24 text-center text-muted-foreground"
                    >
                      Belum ada riwayat job.
                    </TableCell>
                  </TableRow>
                  <TableRow
                    v-for="log in logs"
                    :key="log.id"
                    @click="openLogDetail(log)"
                    class="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
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
                Page {{ pagination.page }} of {{ pagination.lastPage }}
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
                <CardDescription>
                  Konfigurasi Cron Job untuk sinkronisasi otomatis.
                </CardDescription>
              </div>
              <div class="flex items-center gap-2">
                <Button size="sm" @click="openAddDialog" class="cursor-pointer">
                  <Plus class="w-4 h-4 mr-2" />
                  Tambah Jadwal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  @click="fetchSchedules"
                  :disabled="isLoadingSchedules"
                  class="cursor-pointer"
                >
                  <RefreshCw
                    class="w-4 h-4"
                    :class="{ 'animate-spin': isLoadingSchedules }"
                  />
                  Refresh List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead class="w-25">Aktif</TableHead>
                    <TableHead>Cron Expression</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead class="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="sch in schedules" :key="sch.id">
                    <TableCell class="font-medium">{{ sch.jobName }}</TableCell>

                    <TableCell>
                      <Switch
                        :modelValue="!!sch.isActive"
                        @update:modelValue="
                          (val) => toggleScheduleStatus(sch, val)
                        "
                      />
                    </TableCell>

                    <TableCell>
                      <code
                        class="bg-muted px-2 py-1 rounded text-sm font-mono"
                        >{{ sch.cronExpression }}</code
                      >
                    </TableCell>
                    <TableCell>{{ sch.description || '-' }}</TableCell>
                    <TableCell class="text-right">
                      <div class="flex justify-end gap-1">
                        <!-- <Button
                          variant="ghost"
                          size="icon"
                          title="Jalankan Job Ini"
                          @click="triggerJob(sch.jobName)"
                          :disabled="isRunningJob"
                        >
                          <Play class="w-4 h-4 text-green-600" />
                        </Button> -->

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit Jadwal"
                          @click="openEditDialog(sch)"
                          class="cursor-pointer"
                        >
                          <Pencil class="w-4 h-4 text-blue-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Hapus Jadwal"
                          @click="deleteSchedule(sch.jobName)"
                          class="cursor-pointer"
                        >
                          <Trash2 class="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {{
              dialogMode === 'create'
                ? 'Tambah Jadwal Baru'
                : `Edit Jadwal: ${editForm.jobName}`
            }}
          </DialogTitle>
          <DialogDescription>
            {{
              dialogMode === 'create'
                ? 'Pilih job dari sistem dan atur jadwal cron.'
                : 'Ubah konfigurasi waktu eksekusi job ini.'
            }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-6 py-4">
          <div class="grid gap-2">
            <Label>Nama Job</Label>

            <Select v-if="dialogMode === 'create'" v-model="editForm.jobName">
              <SelectTrigger>
                <SelectValue placeholder="Pilih Job..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="job in availableJobs"
                  :key="job"
                  :value="job"
                >
                  {{ job }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              v-else
              v-model="editForm.jobName"
              readonly
              class="bg-muted cursor-not-allowed font-medium"
            />
          </div>

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
          <Button variant="outline" @click="isDialogOpen = false">Batal</Button>
          <Button @click="saveSchedule" :disabled="isUpdatingSchedule">
            <Loader2
              v-if="isUpdatingSchedule"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isLogDetailOpen">
      <DialogContent class="sm:max-w-150">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <History class="w-5 h-5" /> Detail Eksekusi Job
          </DialogTitle>
          <DialogDescription>
            ID: <span class="font-mono text-xs">{{ selectedLog?.id }}</span>
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedLog" class="grid gap-6 py-2">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Nama Job</Label>
              <p class="font-medium">{{ selectedLog.jobName }}</p>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Status Akhir</Label>
              <div>
                <Badge :class="getStatusBadge(selectedLog.status)">
                  {{ selectedLog.status }}
                </Badge>
              </div>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Waktu Mulai</Label>
              <p class="text-sm">{{ formatDate(selectedLog.startTime) }}</p>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Waktu Selesai</Label>
              <p class="text-sm">
                {{ formatDate(selectedLog.endTime) || '-' }}
              </p>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Trigger</Label>
              <p class="text-sm capitalize">{{ selectedLog.triggeredBy }}</p>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Durasi</Label>
              <p class="text-sm">{{ selectedLog.duration || '-' }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-sm font-semibold">
              Log Output / Pesan Error
            </Label>
            <div
              class="rounded-md bg-muted p-4 overflow-x-auto max-h-50 overflow-y-auto mt-2"
            >
              <pre
                v-if="selectedLog.logMessage"
                class="text-xs font-mono whitespace-pre-wrap"
                >{{ selectedLog.logMessage }}</pre
              >
              <p v-else class="text-xs text-muted-foreground italic">
                Tidak ada pesan log tambahan.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="isLogDetailOpen = false"
            >Tutup</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
