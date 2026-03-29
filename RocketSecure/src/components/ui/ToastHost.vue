<template>
  <div class="toast-host" aria-live="polite" aria-relevant="additions removals">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="`toast--${t.type}`"
      role="status"
    >
      <div class="toast__text">{{ t.message }}</div>
      <button class="toast__close" type="button" @click="remove(t.id)" aria-label="Cerrar">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToasts } from "../../composables/useToasts";

const { toasts, remove } = useToasts();
</script>

