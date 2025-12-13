import { useDark, useToggle } from '@vueuse/core';

// Mengatur agar dark mode menambahkan class="dark" di tag <html>
export const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

export const toggleDark = useToggle(isDark);
