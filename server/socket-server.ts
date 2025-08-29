// server/socket-server.ts
import { Server, Socket } from "socket.io";
import WebSocket from "ws";

const PORT = Number(process.env.SOCKET_PORT || 3001);
const CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || "*";
const STREAM_URL =
  process.env.BINANCE_STREAM_URL ||
  "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";

const io = new Server(PORT, { cors: { origin: CORS_ORIGIN } });

const clients = new Set<Socket>();
let upstream: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

function upstreamOpen() {
  return upstream && upstream.readyState === WebSocket.OPEN;
}

function ensureUpstream() {
  if (upstreamOpen()) return;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log(`🔗 [Upstream] connecting → ${STREAM_URL}`);
  upstream = new WebSocket(STREAM_URL);

  upstream.on("open", () => {
    console.log("✅ [Upstream] connected");
  });

  upstream.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const k = msg?.k;
      if (!k) return;

      const payload = {
        timestamp: Math.floor(Number(k.t) / 1000),
        open: Number(k.o),
        high: Number(k.h),
        low: Number(k.l),
        close: Number(k.c),
        final: !!k.x,
      };

      for (const s of clients) {
        s.emit("realtime-candle", payload);
      }
    } catch (err) {
      console.error("[Upstream] parse error:", err);
    }
  });

  upstream.on("close", (code, reason) => {
    console.warn(
      `[Upstream] closed code=${code} reason=${reason.toString() || "-"}`
    );
    upstream = null;
    if (clients.size === 0) return;
    reconnectTimer = setTimeout(ensureUpstream, 1000);
  });

  upstream.on("error", (err) => {
    console.error("[Upstream] error:", err);
    try {
      upstream?.close();
    } catch {}
  });
}

function teardownUpstream() {
  if (upstream) {
    console.log("[Upstream] teardown (no clients)");
    try {
      upstream.removeAllListeners();
      upstream.close();
    } catch {}
    upstream = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  clients.add(socket);
  ensureUpstream();
  socket.on("ping", () => socket.emit("pong"));

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    clients.delete(socket);

    if (clients.size === 0) {
      teardownUpstream();
    }
  });
});

console.log(`Socket.io server running on port ${PORT}`);
