This is a [Next.js](https://nextjs.org/) project that demonstrates using a custom server to support a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) server alongside the normal Next.js application.

The goal is to create a single service that can do everything Next.js normally does, and _also_ handles WebSockets.

![screenshot](public/Screen%20Shot%202023-12-18%20at%2011.08.15%20AM.png)

**Demo: <https://tanstack-query-pubsub.onrender.com/>**

## Getting Started

Install the dependencies and run the development server:

```bash
npm run ci && npm run dev
```

This will prepare the custom server and the Next.js application and start it in development mode, listening on port `3000`.

Open the application in your web browser and you'll see a line of receipts with more appearing every few seconds. Each new receipt is printed when a message is received via a WebSocket.

## How it works

Next.js doesn't support WebSockets on its own, because all of its handlers are designed with regular HTTP requests in mind. To handle WebSockets, you need your own web server that can handle the requests to upgrade a plain HTTP connection into a WebSocket. This doesn't require running a separate service; Next.js allows you to do this customization using a [custom server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server).

> ⚠️ You can't use a custom server with Vercel's hosting platform, so this solution only applies if you're self-hosting your Next.js application in a container or something like that.

### Create the custom server

_The complete custom server (with lots of comments) is at [`server.ts`](server.ts)_

The custom server starts with...you guessed it, a server. We could use anything that yields a [`http.Server`](https://nodejs.org/api/http.html#class-httpserver) and in this case, we'll use [Express](https://expressjs.com/).

```typescript
import { Server } from "node:http";
import express from "express";

const app = express();

/**
 * Start the Express app, get a `http.Server` in return
 */
const server: Server = app.listen(3000);
```

This starts a server that listens on port 3000, but right now it's not doing anything. Let's start by having it delegate requests to Next.js.

```typescript
import next from "next";
import { parse } from "node:url";

/**
 * Start by creating and preparing a Next.js app.
 */
const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
await nextApp.prepare();

/**
 * Pass all plain HTTP requests from Express to the Next.js request handler.
 * `app` is the Express app we started earlier.
 */
app.use((req, res, next) => {
  nextApp.getRequestHandler()(req, res, parse(req.url, true));
});
```

Lastly, we need to handle WebSocket requests by writing a handler for the [`upgrade`](https://nodejs.org/api/http.html#event-upgrade) event.

```typescript
server.on("upgrade", (req, socket, head) => {
  const { pathname } = parse(req.url || "/", true);

  /**
   * Pass hot module reloading requests to Next.js
   */
  if (pathname === "/_next/webpack-hmr") {
    nextApp.getUpgradeHandler()(req, socket, head);
  }

  /**
   * Use another path for our custom WebSocket handler
   */
  if (pathname === "/api/ws") {
    // TODO: write a custom WebSocket handler
  }
});
```

### Handle WebSocket requests

In the [Create the custom server](#create-the-custom-server) section, we created a server that proxies requests to the correct Next.js handlers, but we didn't write our custom WebSocket handler. We'll start by import the [`ws`](https://github.com/websockets/ws) library and using it to create an upgrade handler.

```typescript
import { WebSocketServer } from "ws";

/**
 * Create a singleton "server". By setting `noServer: true` we're configuring
 * it not to listen on any ports. It will only handle requests when we call it
 * programmatically.
 */
const wss = new WebSocketServer({ noServer: true });
```

Next, write a handler that will be called every time a client starts a WebSocket connection:

```typescript
import { RawData, WebSocket } from "ws";
import { IncomingMessage } from "http";
import internal from "stream";

export function handleUpgrade(
  req: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer
) {
  wss.handleUpgrade(req, socket, head, (client: WebSocket) => {
    /**
     * `client` is a single unique WebSocket connection. Here we can subscribe
     * to backend events that we want to send to the client and handle
     * messages that the client sends to us.
     */
    client.send("hello!");

    client.on("message", (data: RawData, isBinary: boolean) => {
      console.log(data.toString());
    });
  });
}
```

Import and use the custom handler:

```typescript
import { handleUpgrade } from "./websocket";

/**
 * Use another path for our custom WebSocket handler
 */
if (pathname === "/api/ws") {
  handleUpgrade(req, socket, head);
}
```

You can extend the WebSocket handler to do anything you want. For this demo, I wrote a service that generates random restaurant orders every few seconds and sends them to the client (see [`src/server/order-service.ts`](./src/server/order-service.ts)).

## Conclusion

When you start the service with `npm run dev` or `npm run start`, you will start a single service that listens on port 3000 and handles WebSocket requests in addition to serving a regular Next.js application on the same port.
