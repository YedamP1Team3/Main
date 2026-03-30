import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
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
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    server: {
        // 프록시 설정: 클라이언트에서 백엔드로 API 요청을 보낼 때 발생하는 CORS 에러를 방지합니다.
        proxy: {
            // 프론트에서 '/api'로 시작하는 경로로 요청을 보내면...
            '^/api': {
                // 이 주소(백엔드 서버)로 요청을 대신 전달해 줍니다.
                target: 'http://localhost:3000',
                changeOrigin: true, // 호스트 헤더의 출처를 target URL로 변경
                // 전달할 때 주소에서 '/api' 글자는 지우고 보냅니다. (예: /api/users -> http://localhost:3000/users)
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            // [추가] info로 시작하는 요청도 3000번 서버로 보낸다!
            '^/info': {
                target: 'http://localhost:3000',
                changeOrigin: true
                // rewrite는 넣지 않습니다. (서버가 /info를 그대로 받아야 하니까요)
            }
        }
    }
});
