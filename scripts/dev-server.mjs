import { createServer } from "vite";

const host = process.env.VITE_HOST || "127.0.0.1";

const server = await createServer({
  server: {
    host,
  },
});

await server.listen();
server.printUrls();

const keepAlive = setInterval(() => {}, 2147483647);

const close = async () => {
  clearInterval(keepAlive);
  await server.close();
  process.exit(0);
};

process.once("SIGINT", close);
process.once("SIGTERM", close);
