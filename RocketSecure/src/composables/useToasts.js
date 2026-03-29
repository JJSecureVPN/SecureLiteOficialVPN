import { readonly, ref } from "vue";

const toasts = ref([]);

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function push(message, { type = "info", duration = 3500 } = {}) {
  const id = createId();
  toasts.value.push({ id, type, message });

  if (duration > 0) {
    window.setTimeout(() => {
      remove(id);
    }, duration);
  }

  return id;
}

function remove(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToasts() {
  return {
    toasts: readonly(toasts),
    push,
    remove,
    info: (msg, opts) => push(msg, { ...opts, type: "info" }),
    success: (msg, opts) => push(msg, { ...opts, type: "success" }),
    warning: (msg, opts) => push(msg, { ...opts, type: "warning" }),
    error: (msg, opts) => push(msg, { ...opts, type: "error" }),
  };
}

