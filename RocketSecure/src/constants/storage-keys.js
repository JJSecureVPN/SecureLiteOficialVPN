/**
 * Centralized localStorage key constants.
 * Avoids duplication across services and makes refactoring easier.
 */
export const STORAGE_KEYS = {
  // Credentials
  username: "mistervpn:username",
  password: "mistervpn:password",
  uuid: "mistervpn:uuid",

  // Server selection
  selectedConfigId: "mistervpn:selected-config-id",
  autoServerMode: "mistervpn:auto-server-mode",
  autoServerSuccessHistory: "mistervpn:auto-server-success-history",

  // Checkuser
  lastUserData: "mistervpn:last-user-data",

  // StatusCard view
  statusView: "rocket-vue-status-view",
};
