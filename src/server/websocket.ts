import { RawData, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import internal from "stream";
import { OrderService } from "@/server/order-service";

const wss = new WebSocketServer({ noServer: true });
const orderService = new OrderService();

export const startWebSocket = (
  req: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer
) => {
  wss.handleUpgrade(req, socket, head, (client) => {
    orderService.subscribe((order) => {
      client.send(
        JSON.stringify({
          event: "order-received",
          detail: {
            order,
          },
        })
      );
    });

    client.on("message", (data: RawData, b: boolean) => {
      if (b) {
        return;
      }

      try {
        let message = JSON.parse(data.toString("utf8")) as {
          event: "ping";
          detail: any;
        };

        switch (message.event) {
          case "ping":
            client.send(`{"event":"pong"}`);
            break;
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
};
