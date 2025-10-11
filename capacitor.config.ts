import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.takkenroad.app",
  appName: "宅建合格ロード",
  webDir: "out",
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#9333ea",
      showSpinner: false,
    },
  },
};

export default config;
