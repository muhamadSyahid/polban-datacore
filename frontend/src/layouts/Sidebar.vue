<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
    LayoutDashboard,
    Activity,
    Database,
    Settings,
    Layers,
} from "lucide-vue-next";

const appVersion = import.meta.env.VITE_APP_VERSION;

const route = useRoute();

// Definisi Menu
const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
    },
    {
        title: "Job Runner",
        icon: Activity,
        path: "/jobs",
    },
    {
        title: "Data Inspector",
        icon: Database,
        path: "/inspector",
    },
    {
        title: "Settings",
        icon: Settings,
        path: "/settings",
    },
];

// Fungsi helper untuk cek active route
const isActive = (path: string) => {
    if (path === "/" && route.path === "/") return true;
    if (path !== "/" && route.path.startsWith(path)) return true;
    return false;
};
</script>

<template>
    <aside
        class="w-64 bg-card border-r border-border h-screen flex flex-col transition-all duration-300"
    >
        <div class="h-16 flex items-center px-6 border-b border-border">
            <Layers class="w-6 h-6 text-primary dark:text-secondary mr-2" />
            <span class="font-bold text-lg tracking-tight text-foreground">
                DataCore <span class="font-normal">Admin</span>
            </span>
        </div>

        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-3 py-2.5 rounded-md transition-colors duration-200 group"
                :class="[
                    isActive(item.path)
                        ? 'bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                ]"
            >
                <component
                    :is="item.icon"
                    class="w-5 h-5 mr-3"
                    :class="
                        isActive(item.path)
                            ? 'text-primary dark:text-secondary'
                            : 'text-muted-foreground group-hover:text-foreground'
                    "
                />
                {{ item.title }}
            </router-link>
        </nav>

        <div class="p-4 border-t border-border text-xs text-muted-foreground">
            <p>Polban DataVerse</p>
            <p>{{ appVersion }}</p>
        </div>
    </aside>
</template>
