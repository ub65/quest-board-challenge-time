
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "app.lovable.4930a47f5b674419b4200a01e4623cf8",
  appName: "quest-board-challenge-time",
  webDir: "dist",
  bundledWebRuntime: false,
  // Enable hot-reload for the mobile app from the Lovable sandbox
  server: {
    url: "https://4930a47f-5b67-4419-b420-0a01e4623cf8.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;
