"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib";

type CandleMsg = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  final: boolean;
};

export default function useLivePriceFromKline(): number | null {
  const [price, setPrice] = useState<number | null>(null);
  const latest = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handler = (msg: CandleMsg) => {
      const p = Number(msg?.close);
      if (!Number.isFinite(p)) return;

      latest.current = p;
      if (raf.current == null) {
        raf.current = requestAnimationFrame(() => {
          setPrice(latest.current);
          raf.current = null;
        });
      }
    };

    sock.on("realtime-candle", handler);
    return () => {
      sock.off("realtime-candle", handler);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return price;
}
