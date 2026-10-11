import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';

function getBuildNumber() {
  const timeZone = 'Asia/Ho_Chi_Minh';
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).formatToParts(now);
  const datePart = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  const date = `${datePart('day')}${datePart('month')}${datePart('year')}`;

  const override = Number(process.env.BUILD_NUMBER);
  if (Number.isInteger(override) && override > 0) {
    return `${date}-${String(override).padStart(2, '0')}`;
  }

  const fullDate = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [year, month, day] = fullDate.split('-').map(Number);
  const dayStart = Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1000;
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  try {
    // Each pushed commit is a build revision; BUILD_NUMBER can override this in CI.
    const dailyRevisionCount = Number(execFileSync('git', [
      'rev-list', '--first-parent', '--count',
      `--since=${new Date(dayStart).toISOString()}`,
      `--until=${new Date(dayEnd).toISOString()}`,
      'HEAD',
    ], { encoding: 'utf8' }).trim());
    const build = Math.max(1, dailyRevisionCount);
    return `${date}-${String(build).padStart(2, '0')}`;
  } catch {
    return `${date}-01`;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_NUMBER__: JSON.stringify(getBuildNumber()),
  },
  plugins: [
    react(),
    {
      name: 'srcbook-error-reporter',

      // ref: https://vite.dev/guide/api-plugin.html#transformindexhtml
      transformIndexHtml(html) {
        if (process.env.NODE_ENV !== 'development') {
          return html;
        }

        return [{
          tag: 'script',
          attrs: { type: 'module' },
          injectTo: 'head',
          children: `
            // Report any logs, errors, etc to the parent srcbook app context to include in
            // the bottom panel.
            for (const method of ['log', 'debug', 'info', 'error', 'warn']) {
              const originalFn = console[method];
              console[method] = function(...args) {
                window.parent.postMessage({ type: 'console', method, args: args.map(a => \`\${a}\`) }, '*');
                return originalFn(...args);
              };
            }

            // Report any thrown errors / promise rejections so they show up in the logs
            window.addEventListener('error', (e) => {
              if (window.parent) {
                window.parent.postMessage({ type: 'error', stack: e.error.stack }, '*');
              }
            });
            window.addEventListener('unhandledrejection', (e) => {
              if (window.parent) {
                window.parent.postMessage({ type: 'unhandledrejection', reason: e.reason }, '*');
              }
            });

            // Report URL change event from iframe
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            const notifyParent = () => {
              window.parent.postMessage({ type: 'iframe_url_changed', url: window.location.href }, '*');
            };

            history.pushState = function (...args) {
              originalPushState.apply(this, args);
              notifyParent();
            };

            history.replaceState = function (...args) {
              originalReplaceState.apply(this, args);
              notifyParent();
            };

            window.addEventListener('popstate', notifyParent);
            window.addEventListener('hashchange', notifyParent);
          `,
        }];
      },

      transform(src: string, id: string) {
        if (id === '/app/src/main.tsx') {
          return `
            ${src}
            if (process.env.NODE_ENV === 'development') {
              // Report any vite-hmr errors up to the parent srcbook app context
              // Full event list: https://vite.dev/guide/api-hmr.html
              if (import.meta.hot) {
                import.meta.hot.on('vite:error', (data) => {
                  if (window.parent) {
                    window.parent.postMessage({ type: 'vite:hmr:error', data }, '*');
                  }
                });
                import.meta.hot.on('vite:beforeUpdate', (data) => {
                  if (window.parent) {
                    window.parent.postMessage({ type: 'vite:hmr:beforeUpdate', data }, '*');
                  }
                });
                import.meta.hot.on('vite:afterUpdate', (data) => {
                  if (window.parent) {
                    window.parent.postMessage({ type: 'vite:hmr:afterUpdate', data }, '*');
                  }
                });
              }
            }
          `;
        }
      },
    },
  ],
});
