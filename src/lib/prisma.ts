import "dotenv/config";
import https from "https";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("localhost"));

// In production / cloud environments, use standard global fetch.
// Only override fetchFunction in local development if needed for IPv4 fallback.
if (!isProduction) {
  neonConfig.fetchFunction = function (url: string | URL, options: Record<string, any> = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = typeof url === "string" ? new URL(url) : url;

      const reqHeaders: Record<string, string> = {};
      if (options.headers) {
        if (typeof options.headers.forEach === "function") {
          options.headers.forEach((v: string, k: string) => {
            reqHeaders[k] = v;
          });
        } else {
          Object.assign(reqHeaders, options.headers);
        }
      }

      const reqOptions: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "POST",
        headers: reqHeaders,
        family: 4,
      };

      const req = https.request(reqOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const respHeaders = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (Array.isArray(v)) {
              v.forEach((val) => respHeaders.append(k, val));
            } else if (v !== undefined) {
              respHeaders.set(k, v);
            }
          }

          resolve({
            ok: res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false,
            status: res.statusCode || 500,
            statusText: res.statusMessage || "",
            headers: respHeaders,
            json: () => Promise.resolve(data ? JSON.parse(data) : null),
            text: () => Promise.resolve(data),
            arrayBuffer: () => Promise.resolve(Buffer.from(data)),
          } as any);
        });
      });

      req.on("error", reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  };
}

const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL environment variable is missing in environment settings.");
}

const adapter = new PrismaNeonHttp(connectionString || "postgresql://invalid:invalid@localhost:5432/invalid", {
  arrayMode: false,
  fullResults: false,
});

const prisma = new PrismaClient({ adapter });

export { prisma };



