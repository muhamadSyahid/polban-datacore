<script setup lang="ts">
import Sidebar from "@/layouts/Sidebar.vue";
import Navbar from "@/layouts/Navbar.vue";
</script>

<template>
    <div class="flex h-screen bg-background overflow-hidden">
        <Sidebar />

        <div class="flex-1 flex flex-col min-w-0">
            <Navbar />

            <main class="flex-1 overflow-y-auto p-6 md:p-8 relative">
                <div class="max-w-7xl mx-auto space-y-6">
                    <slot>
                        <RouterView />
                    </slot>
                </div>
            </main>
        </div>
    </div>
</template>
