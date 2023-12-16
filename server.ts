import { parse } from "url";
import express from "express";
import next from "next";
import { startWebSocket } from "@/server/websocket";

async function start() {
  const app = express();

  // when using middleware `hostname` and `port` must be provided below
  const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
  await nextApp.prepare();
  const nextHandler = nextApp.getRequestHandler();
  const nextHmr = nextApp.getUpgradeHandler();

  app.use((req, res, next) => {
    nextHandler(req, res, parse(req.url, true));
  });

  console.time("listen");
  const server = app.listen(3000, () => {
    console.timeLog("listen");
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "/", true);
    console.log(pathname);

    if (pathname === "/_next/webpack-hmr") {
      nextHmr(req, socket, head);
    }
    if (pathname === "/api/ws") {
      startWebSocket(req, socket, head);
    }
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
