import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rainvilla.pms",
  appName: "Rain Villa PMS",
  webDir: "public",
  server: {
    url: "https://rain-villas-pms-2t1k.vercel.app",
    cleartext: false,
  },
};

export default config;