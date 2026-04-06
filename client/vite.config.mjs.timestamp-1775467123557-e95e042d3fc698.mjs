// vite.config.mjs
import { fileURLToPath, URL } from "node:url";
import { PrimeVueResolver } from "file:///C:/Users/admin/Desktop/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%ED%92%80/client/node_modules/@primevue/auto-import-resolver/index.mjs";
import tailwindcss from "file:///C:/Users/admin/Desktop/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%ED%92%80/client/node_modules/@tailwindcss/vite/dist/index.mjs";
import vue from "file:///C:/Users/admin/Desktop/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%ED%92%80/client/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///C:/Users/admin/Desktop/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%ED%92%80/client/node_modules/unplugin-vue-components/dist/vite.js";
import { defineConfig } from "file:///C:/Users/admin/Desktop/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%ED%92%80/client/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/admin/Desktop/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%ED%92%80/client/vite.config.mjs";
var vite_config_default = defineConfig({
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
  server: {
    // 프록시 설정: 클라이언트에서 백엔드로 API 요청을 보낼 때 발생하는 CORS 에러를 방지합니다.
    proxy: {
      // 프론트에서 '/api'로 시작하는 경로로 요청을 보내면...
      "^/api": {
        // 이 주소(백엔드 서버)로 요청을 대신 전달해 줍니다.
        target: "http://localhost:3000",
        changeOrigin: true,
        // 호스트 헤더의 출처를 target URL로 변경
        // 전달할 때 주소에서 '/api' 글자는 지우고 보냅니다. (예: /api/users -> http://localhost:3000/users)
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    },
    build: {
      // outDir: '../../server/public'
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWRtaW5cXFxcRGVza3RvcFxcXFxcdUQ1MDRcdUI4NUNcdUM4MURcdUQyQjhcdUQ0ODBcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFxEZXNrdG9wXFxcXFx1RDUwNFx1Qjg1Q1x1QzgxRFx1RDJCOFx1RDQ4MFxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9hZG1pbi9EZXNrdG9wLyVFRCU5NCU4NCVFQiVBMSU5QyVFQyVBMCU5RCVFRCU4QSVCOCVFRCU5MiU4MC9jbGllbnQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5pbXBvcnQgeyBQcmltZVZ1ZVJlc29sdmVyIH0gZnJvbSAnQHByaW1ldnVlL2F1dG8taW1wb3J0LXJlc29sdmVyJztcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgICAgbm9EaXNjb3Zlcnk6IHRydWVcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgdnVlKCksXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICAgICAgcmVzb2x2ZXJzOiBbUHJpbWVWdWVSZXNvbHZlcigpXVxuICAgICAgICB9KVxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgICAgIHNjc3M6IHtcbiAgICAgICAgICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICAvLyBcdUQ1MDRcdUI4NURcdUMyREMgXHVDMTI0XHVDODE1OiBcdUQwNzRcdUI3N0NcdUM3NzRcdUM1QjhcdUQyQjhcdUM1RDBcdUMxMUMgXHVCQzMxXHVDNUQ0XHVCNERDXHVCODVDIEFQSSBcdUM2OTRcdUNDQURcdUM3NDQgXHVCQ0Y0XHVCMEJDIFx1QjU0QyBcdUJDMUNcdUMwRERcdUQ1NThcdUIyOTQgQ09SUyBcdUM1RDBcdUI3RUNcdUI5N0MgXHVCQzI5XHVDOUMwXHVENTY5XHVCMkM4XHVCMkU0LlxuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgLy8gXHVENTA0XHVCODYwXHVEMkI4XHVDNUQwXHVDMTFDICcvYXBpJ1x1Qjg1QyBcdUMyRENcdUM3OTFcdUQ1NThcdUIyOTQgXHVBQ0JEXHVCODVDXHVCODVDIFx1QzY5NFx1Q0NBRFx1Qzc0NCBcdUJDRjRcdUIwQjRcdUJBNzQuLi5cbiAgICAgICAgICAgICdeL2FwaSc6IHtcbiAgICAgICAgICAgICAgICAvLyBcdUM3NzQgXHVDOEZDXHVDMThDKFx1QkMzMVx1QzVENFx1QjREQyBcdUMxMUNcdUJDODQpXHVCODVDIFx1QzY5NFx1Q0NBRFx1Qzc0NCBcdUIzMDBcdUMyRTAgXHVDODA0XHVCMkVDXHVENTc0IFx1QzkwRFx1QjJDOFx1QjJFNC5cbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSwgLy8gXHVENjM4XHVDMkE0XHVEMkI4IFx1RDVFNFx1QjM1NFx1Qzc1OCBcdUNEOUNcdUNDOThcdUI5N0MgdGFyZ2V0IFVSTFx1Qjg1QyBcdUJDQzBcdUFDQkRcbiAgICAgICAgICAgICAgICAvLyBcdUM4MDRcdUIyRUNcdUQ1NjAgXHVCNTRDIFx1QzhGQ1x1QzE4Q1x1QzVEMFx1QzExQyAnL2FwaScgXHVBRTAwXHVDNzkwXHVCMjk0IFx1QzlDMFx1QzZCMFx1QUNFMCBcdUJDRjRcdUIwQzVcdUIyQzhcdUIyRTQuIChcdUM2MDg6IC9hcGkvdXNlcnMgLT4gaHR0cDovL2xvY2FsaG9zdDozMDAwL3VzZXJzKVxuICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIC8vIG91dERpcjogJy4uLy4uL3NlcnZlci9wdWJsaWMnXG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVYsU0FBUyxlQUFlLFdBQVc7QUFFcFgsU0FBUyx3QkFBd0I7QUFDakMsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsb0JBQW9CO0FBTjZKLElBQU0sMkNBQTJDO0FBUzNPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLGNBQWM7QUFBQSxJQUNWLGFBQWE7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsSUFBSTtBQUFBLElBQ0osWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLE1BQ1AsV0FBVyxDQUFDLGlCQUFpQixDQUFDO0FBQUEsSUFDbEMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDeEQ7QUFBQSxFQUNKO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDRCxxQkFBcUI7QUFBQSxNQUNqQixNQUFNO0FBQUEsUUFDRixLQUFLO0FBQUEsTUFDVDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVKLE9BQU87QUFBQTtBQUFBLE1BRUgsU0FBUztBQUFBO0FBQUEsUUFFTCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQTtBQUFBLFFBRWQsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLE1BQ2hEO0FBQUEsSUFDSjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsSUFFUDtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
