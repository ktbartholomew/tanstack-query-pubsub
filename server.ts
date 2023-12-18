import { parse } from "url";
import express from "express";
import next from "next";

/**
 * This is a function I created that handles the arguments to the `upgrade`
 * event. It doesn't start a server of its own, but handles individual upgrade
 * requests as they come in.
 */
import { startWebSocket } from "@/server/websocket";

/**
 * Wrap the main entrypoint in an async function so we can use async/await
 * syntax without needing top-level await support
 */
async function start() {
  /**
   * Create an Express app. This is what we'll use to serve all requests
   */
  const app = express();

  /**
   * Create a Next.js app. This will handle most of the application's requests,
   * except those that are WebSockets.
   */
  const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
  await nextApp.prepare();

  /**
   * Next.js exposes a single handler for all of its plain HTTP
   * requests, like rendering pages and serving assets.
   */
  const nextHandler = nextApp.getRequestHandler();

  /**
   * Next.js also exposes a WebSocket handler, but it only exists to facilitate
   * "Fast Refresh" during development. This is a really helpful feature, so we
   * want to make sure it's working.
   */
  const nextHmr = nextApp.getUpgradeHandler();

  /**
   * Start the Express app, get a `http.Server` in return
   */
  const server = app.listen(3000, () => {
    console.log("listening on :3000");
  });

  /**
   * Pass every plain HTTP request through an Express middleware. All it does
   * is pass the request on to the Next.js handler.
   */
  app.use((req, res, next) => {
    nextHandler(req, res, parse(req.url, true));
  });

  /**
   * Add an event handler to the server to handle `upgrade` requests. This will
   * be called whenever a client attempts to start a WebSocket connection.
   */
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "/", true);

    /**
     * `/_next/webpack-hmr` is the fixed path that Next.js uses for hot module
     * reloading. When the request has this path, send it to their handler.
     */
    if (pathname === "/_next/webpack-hmr") {
      nextHmr(req, socket, head);
    }

    /**
     * `/api/ws` is the path we've chosen for our custom WebSocket handler. When
     * the request has this path, send it to our handler.
     */
    if (pathname === "/api/ws") {
      startWebSocket(req, socket, head);
    }
  });
}

/**
 * Run the async `start` function and exit if it errors.
 */
start().catch((e) => {
  console.error(e);
  process.exit(1);
});
