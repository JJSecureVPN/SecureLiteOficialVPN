import { ref } from "vue";

export const autoAuthErrorText = ref("No fue posible autenticar en el servidor.");

export const setAutoAuthErrorText = (text) => {
  autoAuthErrorText.value = text || "No fue posible autenticar en el servidor.";
};
