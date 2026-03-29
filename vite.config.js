import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function vercelApiBridge(mode) {
  return {
    name: 'vercel-api-bridge',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');
      Object.entries(env).forEach(([key, value]) => {
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const endpointNames = {
          '/api/send-alert': './api/send-alert.js',
          '/api/gemini': './api/gemini.js',
          '/api/elevenlabs': './api/elevenlabs.js'
        };

        const targetFile = endpointNames[req.url.split('?')[0]];
        if (!targetFile) {
          return next();
        }

        const chunks = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }

        const rawBody = Buffer.concat(chunks).toString('utf8');
        req.body = rawBody ? JSON.parse(rawBody) : {};

        res.status = function status(code) {
          res.statusCode = code;
          return res;
        };

        res.json = function json(payload) {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
          }
          res.end(JSON.stringify(payload));
          return res;
        };

        res.send = function send(payload) {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'audio/mpeg');
          }
          res.end(payload);
          return res;
        };

        const handlerUrl = new URL(targetFile, import.meta.url);
        const { default: handler } = await import(`${handlerUrl.href}?t=${Date.now()}`);
        return handler(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), vercelApiBridge(mode)],
  server: {
    port: 5173,
  },
}));
