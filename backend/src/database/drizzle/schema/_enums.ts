import { pgEnum } from 'drizzle-orm/pg-core';

export const jenisKelaminEnum = pgEnum('jenis_kelamin_enum', ['L', 'P']);

export const agamaEnum = pgEnum('agama_enum', [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Khonghucu',
  'Lainnya',
]);

export const semesterEnum = pgEnum('semester_enum', ['Ganjil', 'Genap']);

export const nilaiHurufEnum = pgEnum('nilai_huruf_enum', [
  'A',
  'AB',
  'B',
  'BC',
  'C',
  'CD',
  'D',
  'E',
  'T',
]);
