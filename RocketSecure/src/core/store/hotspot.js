import { ref } from "vue";
import { sdk, hasBridge } from "../bridge/sdk";

export const hotSpotState = ref("STOPPED");

export const applyHotSpotState = (value) => {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "STOPPED";
  hotSpotState.value = normalized || "STOPPED";
};

export const refreshHotSpotState = () => {
  if (!sdk || !hasBridge("DtGetStatusHotSpotService")) {
    applyHotSpotState("STOPPED");
    return;
  }
  applyHotSpotState(sdk.android.getHotSpotStatus());
};

export const startRouting = () => {
  if (!sdk || !hasBridge("DtStartHotSpotService")) return false;
  sdk.android.startHotSpotService();
  applyHotSpotState("RUNNING");
  return true;
};

export const stopRouting = () => {
  if (!sdk || !hasBridge("DtStopHotSpotService")) return false;
  sdk.android.stopHotSpotService();
  applyHotSpotState("STOPPED");
  return true;
};
