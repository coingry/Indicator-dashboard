// src/hooks/useBTCRealtimeSocket.ts
"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { BTCRow } from "@/types";

export default function useBTCRealtimeSocket(onCandle: (c: BTCRow) => void) {
  const handlerRef = useRef(onCandle);
  handlerRef.current = onCandle;

  useEffect(() => {
    const url =
      process.env.NEXT_PUBLIC_SOCKET_URL ??
      `${location.protocol === "https:" ? "https" : "http"}://${
        location.hostname
      }:3001`;

    const socket: Socket = io(url, {
      transports: ["websocket"],
    });

    const onRealtime = (c: BTCRow) => handlerRef.current?.(c);

    socket.on("connect", () => console.log("[socket] connected", socket.id));
    socket.on("realtime-candle", onRealtime);
    socket.on("disconnect", (r) => console.log("[socket] disconnected", r));

    return () => {
      socket.off("realtime-candle", onRealtime);
      socket.close();
    };
  }, []);
}
