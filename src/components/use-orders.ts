import { Order } from "@/server/order-service";
import { useEffect, useState } from "react";

let ws: WebSocket;
if (typeof window !== "undefined") {
  ws = new WebSocket(`wss://${window.location.host}/api/ws`);
  setInterval(() => {
    if (ws.readyState !== ws.OPEN) {
      ws = new WebSocket(`wss://${window.location.host}/api/ws`);
      return;
    }

    ws.send(`{"event":"ping"}`);
  }, 29000);
}

export function useOrders() {
  const [log, setLog] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  function info(msg: any) {
    setLog((prev) => {
      return prev + msg + "\n";
    });
  }

  useEffect(() => {
    const onMessage = (msg: MessageEvent) => {
      console.log(msg.data);
      info(msg.data);

      try {
        const event = JSON.parse(msg.data) as { event: string; detail: any };

        if (event.event === "order-received") {
          setOrders((prev) => {
            const next = [...prev];
            next.push(event.detail.order as Order);
            return next;
          });
        }
      } catch (e) {
        // do nothing
      }
    };

    try {
      ws.addEventListener("message", onMessage);
    } catch (err) {
      info(err);
    }

    return () => {
      ws.removeEventListener("message", onMessage);
    };
  }, []);

  return { log, orders };
}
