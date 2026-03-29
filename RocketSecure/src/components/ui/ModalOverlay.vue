<template>
  <Transition name="overlay">
    <div
      v-if="activeModalId"
      class="modal-overlay"
      id="modal-overlay"
      @click="closeActiveModal"
    ></div>
  </Transition>
</template>

<script setup>
import { useModals } from "../../composables/useModals";

const { activeModalId, closeModal } = useModals();

const closeActiveModal = () => {
  closeModal();
};
</script>
