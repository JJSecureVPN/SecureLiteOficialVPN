import { ref, computed } from "vue";

const activeModalId = ref(null);
const onOpenCallbacks = new Map();

export const useModals = () => {
  const isOpen = (id) => activeModalId.value === id;

  const openModal = (id, onOpen) => {
    if (activeModalId.value === id) {
      if (onOpen) onOpen();
      return;
    }

    activeModalId.value = id;
    if (onOpen) {
      onOpenCallbacks.set(id, onOpen);
      onOpen();
    }
  };

  const closeModal = () => {
    activeModalId.value = null;
  };

  const getActiveModalId = () => activeModalId.value;

  const isAnyModalOpen = computed(() => !!activeModalId.value);

  return {
    activeModalId,
    isOpen,
    isAnyModalOpen,
    openModal,
    closeModal,
    getActiveModalId,
  };
};
