# Development server

- When asked to launch this project's dev server, use Wrangler Pages so Pages Functions and bindings such as `BILLS` run locally. Build the site first, then run `npx wrangler pages dev dist --ip 0.0.0.0 --port 5173 --persist-to .wrangler/state` (choose another available port if needed).
- When opening the server from another machine on the tailnet, use `http://minisforum:<port>/` instead of `localhost`.
