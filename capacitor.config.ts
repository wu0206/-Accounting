import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wu0206.moneykeeper', // App ID (上架用)
  appName: '荷包守衛',              // 手機桌面上顯示的 App 名稱
  webDir: 'dist',                  // 打包後的網頁資料夾
  server: {
    androidScheme: 'https'
  }
};

export default config;