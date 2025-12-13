<script setup lang="ts">
import { useAuthStore } from "@/stores/auth.store";
import ThemeToggle from "@/layouts/ThemeToggle.vue";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-vue-next";

const auth = useAuthStore();

const handleLogout = () => {
    auth.logout();
};

// Ambil inisial nama untuk Avatar Fallback
const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
};
</script>

<template>
    <header
        class="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10"
    >
        <div>
            <h2 class="text-sm font-medium text-muted-foreground">
                Selamat Datang,
                <span class="text-foreground font-semibold">{{
                    auth.user?.name || "Admin"
                }}</span>
            </h2>
        </div>

        <div class="flex items-center gap-4">
            <ThemeToggle />

            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button
                        variant="ghost"
                        class="relative h-9 w-9 rounded-full"
                    >
                        <Avatar class="h-9 w-9 border border-border">
                            <AvatarImage src="" alt="User" />
                            <AvatarFallback class="text-primary">
                                {{ getInitials(auth.user?.email || "AD") }}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56" align="end">
                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                    <div
                        class="px-2 py-1.5 text-xs text-muted-foreground truncate"
                    >
                        {{ auth.user?.email }}
                    </div>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        class="cursor-pointer text-destructive dark:text-red-400 focus:text-destructive hover:dark:text-red-300"
                        @click="handleLogout"
                    >
                        <LogOut class="mr-2 h-4 w-4" />
                        <span>Keluar</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
</template>
