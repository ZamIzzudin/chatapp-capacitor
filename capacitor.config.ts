/** @format */

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "chatapp",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
    allowNavigation: [
      "192.168.141.227:3001",
      "localhost:3001"
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
