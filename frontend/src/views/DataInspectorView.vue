<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { toast } from 'vue-sonner';
import { inspectorService } from '@/api/inspector.service';

// Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
} from 'lucide-vue-next';

// STATE
const mvList = ref<string[]>([]);
const selectedTable = ref<string>('');
const tableData = ref<any[]>([]);
const pagination = ref({ page: 1, lastPage: 1, total: 0, perPage: 10 });
const searchQuery = ref('');

// LOADING STATES
const isLoadingList = ref(false);
const isLoadingData = ref(false);

// COMPUTED: Dynamic Columns based on first row of data
const tableHeaders = computed(() => {
  if (tableData.value.length === 0) return [];
  return Object.keys(tableData.value[0]);
});

// ACTIONS
const fetchMvList = async () => {
  isLoadingList.value = true;
  try {
    const list = await inspectorService.getMvList();
    mvList.value = list;
    // Auto select first table if available
    if (list.length > 0 && !selectedTable.value) {
      selectedTable.value = list[0]!;
    }
  } catch (err) {
    toast.error('Gagal memuat daftar tabel');
  } finally {
    isLoadingList.value = false;
  }
};

const fetchData = async () => {
  if (!selectedTable.value) return;

  isLoadingData.value = true;
  try {
    const res = await inspectorService.getMvData(
      selectedTable.value,
      pagination.value.page,
      pagination.value.perPage,
      searchQuery.value,
    );
    tableData.value = res.data;
    pagination.value = {
      page: res.meta.page,
      lastPage: res.meta.lastPage,
      total: res.meta.total,
      perPage: res.meta.perPage,
    };
  } catch (err) {
    toast.error('Gagal memuat data tabel');
    tableData.value = [];
  } finally {
    isLoadingData.value = false;
  }
};

// HANDLERS
const handleSearch = () => {
  pagination.value.page = 1;
  fetchData();
};

// Manual Debounce untuk Search (delay 500ms)
let searchTimeout: number;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 1000);
};

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > pagination.value.lastPage) return;
  pagination.value.page = newPage;
  fetchData();
};

// WATCHERS
watch(selectedTable, () => {
  searchQuery.value = '';
  pagination.value.page = 1;
  fetchData();
});

onMounted(() => {
  fetchMvList();
});
</script>

<template>
  <div class="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Data Inspector
        </h1>
        <p class="text-muted-foreground">
          Inspeksi langsung isi tabel Materialized View (Read-Only).
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="fetchData"
          :disabled="isLoadingData || !selectedTable"
        >
          <RefreshCw
            class="w-4 h-4 mr-2"
            :class="{ 'animate-spin': isLoadingData }"
          />
          Refresh Data
        </Button>
      </div>
    </div>

    <div
      class="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-lg shadow-sm"
    >
      <div class="w-full sm:w-75">
        <Select v-model="selectedTable" :disabled="isLoadingList">
          <SelectTrigger>
            <SelectValue placeholder="Pilih Tabel..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="mv in mvList" :key="mv" :value="mv">
              <div class="flex items-center">
                <TableIcon class="w-4 h-4 mr-2 text-muted-foreground" />
                {{ mv }}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="relative w-full sm:w-100">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Cari data di tabel ini..."
          class="pl-9"
          v-model="searchQuery"
          @input="onSearchInput"
          :disabled="!selectedTable"
        />
      </div>
    </div>

    <div
      class="flex-1 border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col relative"
    >
      <div v-if="isLoadingData" class="p-4 space-y-4">
        <div class="flex items-center space-x-4">
          <Skeleton class="h-12 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="h-8 w-full" v-for="i in 5" :key="i" />
        </div>
      </div>

      <div v-else class="flex-1 overflow-auto">
        <Table>
          <TableHeader
            class="sticky top-0 bg-secondary/50 dark:bg-secondary/30 backdrop-blur z-10"
          >
            <TableRow>
              <TableHead
                class="w-12.5 font-semibold text-primary dark:text-primary-foreground"
                >#</TableHead
              >
              <TableHead
                v-for="header in tableHeaders"
                :key="header"
                class="capitalize whitespace-nowrap font-semibold text-primary dark:text-primary-foreground"
              >
                {{ header.replace(/([a-z])([A-Z])/g, '$1 $2') }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="tableData.length === 0">
              <TableCell
                :colspan="tableHeaders.length + 1"
                class="h-32 text-center text-muted-foreground"
              >
                <div class="flex flex-col items-center justify-center gap-2">
                  <Database class="w-8 h-8 text-muted-foreground/50" />
                  <p>Tidak ada data ditemukan.</p>
                </div>
              </TableCell>
            </TableRow>

            <TableRow
              v-for="(row, idx) in tableData"
              :key="idx"
              class="hover:bg-muted/50"
            >
              <TableCell class="font-mono text-xs text-muted-foreground">
                {{ (pagination.page - 1) * pagination.perPage + idx + 1 }}
              </TableCell>
              <TableCell
                v-for="header in tableHeaders"
                :key="header + idx"
                class="whitespace-nowrap"
              >
                <span
                  v-if="row[header] === null"
                  class="text-muted-foreground italic"
                  >null</span
                >
                <span
                  v-else-if="typeof row[header] === 'boolean'"
                  :class="row[header] ? 'text-green-600' : 'text-red-600'"
                >
                  {{ String(row[header]) }}
                </span>
                <span v-else>
                  {{ row[header] }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div
        class="p-4 border-t flex items-center justify-between bg-card shrink-0"
      >
        <div class="text-sm text-muted-foreground">
          Total <strong>{{ pagination.total }}</strong> baris
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page <= 1 || isLoadingData"
            @click="changePage(pagination.page - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <div class="text-sm font-medium w-20 text-center">
            Hal {{ pagination.page }} / {{ pagination.lastPage }}
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page >= pagination.lastPage || isLoadingData"
            @click="changePage(pagination.page + 1)"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
