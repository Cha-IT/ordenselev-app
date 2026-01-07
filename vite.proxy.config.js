import { defineConfig, loadEnv } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    server: {
        host: true,
        port: 5100,
        proxy: {
            '/': {
                target: 'http://dbaccess:5555',
                changeOrigin: true,
                configure: (proxy, options) => {
                    // Bypass the proxy if the password check fails
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        const auth = req.headers['authorization'];

                        if (!auth) {
                            return returnAuthRequired(res);
                        }

                        // Basic auth format is "Basic base64(username:password)"
                        // We'll ignore the username and just check the password
                        const tmp = auth.split(' ');
                        const buf = Buffer.from(tmp[1], 'base64');
                        const [username, password] = buf.toString().split(':');

                        if (password !== process.env.VITE_PRISMA_PASSWORD) {
                            return returnAuthRequired(res);
                        }
                    });
                },
            },
        },
    },
});

function returnAuthRequired(res) {
    res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="Secure Proxy", charset="UTF-8"',
    });
    res.end('Authentication required.');
}