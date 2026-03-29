export const sdk =
  typeof window.DTunnelSDK === "function"
    ? new window.DTunnelSDK({
        strict: false,
        autoRegisterNativeEvents: true,
      })
    : null;

export const hasBridge = (bridgeName) =>
  !!(
    sdk &&
    typeof sdk.hasBridgeObject === "function" &&
    sdk.hasBridgeObject(bridgeName)
  );

export const onSdkEvent = (eventName, handler) => {
  if (!sdk || typeof sdk.on !== "function") {
    return;
  }
  sdk.on(eventName, handler);
};
