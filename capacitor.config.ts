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
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "586131197546-6ip5mhg8d1l5em5behdtsj4iptd63e9v.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
