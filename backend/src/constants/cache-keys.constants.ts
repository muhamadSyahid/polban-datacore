export const GUEST_CACHE_KEYS = {
  // /api/v1/guest/mahasiswa/gender
  MAHASISWA_GENDER: 'guest:mahasiswa:gender',

  // /api/v1/guest/mahasiswa/jenis-slta
  MAHASISWA_JENIS_SLTA: 'guest:mahasiswa:jenis-slta',

  // /api/v1/guest/mahasiswa/rasio-dosen-mhs
  MAHASISWA_RASIO_DOSEN: 'guest:mahasiswa:rasio-dosen',

  // /api/v1/guest/mahasiswa/domisili
  MAHASISWA_DOMISILI_ALL: 'guest:mahasiswa:domisili:all',

  // Prefix untuk domisili per provinsi (misal: guest:domisili:provinsi:jawa-barat)
  MAHASISWA_DOMISILI_PROVINSI_PREFIX: 'guest:mahasiswa:domisili:provinsi:',

  // /api/v1/guest/mahasiswa/agama
  MAHASISWA_AGAMA: 'guest:mahasiswa:agama',
};

export const AKADEMIK_CACHE_KEYS = {
  // /api/v1/akademik/distribusi-nilai
  DISTRIBUSI_NILAI: 'akademik:distribusi-nilai',

  // /api/v1/akademik/tren-ip-rata-rata
  TREN_IP_RATA_RATA: 'akademik:tren-ip-rata-rata',

  // /api/v1/akademik/tren-ip-tertinggi
  TREN_IP_TERTINGGI: 'akademik:tren-ip-tertinggi',

  // /api/v1/akademik/tipe-tes-masuk
  TIPE_TES_MASUK: 'akademik:tipe-tes-masuk',
};

export const KEMAHASISWAAN_CACHE_KEYS = {
  // /api/v1/mahasiswa/jumlah-mahasiswa
  JUMLAH_MAHASISWA: 'kemahasiswaan:jumlah-mahasiswa',

  // /api/v1/mahasiswa/gender
  GENDER: 'kemahasiswaan:gender',

  // /api/v1/mahasiswa/jenis-slta
  JENIS_SLTA: 'kemahasiswaan:jenis-slta',

  // /api/v1/mahasiswa/agama
  AGAMA: 'kemahasiswaan:agama',
};
