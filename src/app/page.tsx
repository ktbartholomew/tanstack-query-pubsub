"use client";

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

function useStreamingEvents() {
  const [log, setLog] = useState("");

  function info(msg: any) {
    setLog((prev) => {
      return prev + msg + "\n";
    });
  }

  useEffect(() => {
    const onMessage = (msg: MessageEvent) => {
      console.log(msg.data);
      info(msg.data);
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

  return { log };
}

export default function Home() {
  const { log } = useStreamingEvents();

  return (
    <main className="p-24">
      <div className="border border-sky-200 p-4 rounded-lg bg-gray-100 bg-opacity-90 backdrop-blur-lg text-gray-900 w-[40ch] max-w-full mb-4">
        <h3 className="text-2xl mb-2">Test Title of a Thing</h3>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore
          recusandae, magni sequi earum fugit pariatur obcaecati nihil eum
          laudantium placeat voluptate quidem sit labore. Esse, iste temporibus!
          Fugiat, ea vel.
        </p>
      </div>
      <pre>
        <code>{log}</code>
      </pre>
    </main>
  );
}
