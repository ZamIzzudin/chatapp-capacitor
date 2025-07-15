/** @format */

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "chatapp",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
