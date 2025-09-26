import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss()],
    server: {
      hmr: false, // Tắt Hot Module Replacement để tránh auto-reload
      proxy: {
        "/api": {
          // Sử dụng target cố định để đảm bảo ổn định cho các endpoint hiện có
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // Đảm bảo các biến môi trường được expose cho client
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});
