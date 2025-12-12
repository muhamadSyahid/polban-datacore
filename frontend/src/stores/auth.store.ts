import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useStorage, StorageSerializers } from "@vueuse/core";
import router from "../router";

interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
}

export const useAuthStore = defineStore("auth", () => {
  const token = useStorage<string | null>("datacore-token", null);
  const user = useStorage<User | null>("datacore-user", null, localStorage, {
    serializer: StorageSerializers.object,
  });

  // Getters
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  function setAuth(newToken: string, newUser: User) {
    token.value = newToken;
    user.value = newUser;
  }

  function logout() {
    token.value = null;
    user.value = null;
    router.push("/login");
  }

  return { token, user, isAuthenticated, setAuth, logout };
});
