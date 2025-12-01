export const JOB_NAMES = {
  // ETL (Extract & Load) Jobs
  // Job untuk menarik data mentah dari DataHub ke Fact Tables
  SYNC_MAHASISWA: 'sync-mahasiswa',
  SYNC_DOSEN: 'sync-dosen',
  SYNC_AKADEMIK: 'sync-akademik',

  // Aggregation (Transform) Jobs
  // Job untuk merefresh materialized views dari Fact Tables

  // Aggregation untuk API Guest (Data Publik)
  AGGREGATE_GUEST_DATA: 'aggregate-guest-data',

  // Aggregation untuk API Akademik (Data Internal)
  AGGREGATE_AKADEMIK_DATA: 'aggregate-akademik-data',

  // Aggregation untuk API Kemahasiswaan (Data Internal)
  AGGREGATE_KEMAHASISWAAN_DATA: 'aggregate-kemahasiswaan-data',

  // Menjalankan semuanya berurutan
  FULL_SYNC_AND_AGGREGATE: 'full-sync-and-aggregate',
};
