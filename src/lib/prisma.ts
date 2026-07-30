import "dotenv/config";
import https from "https";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma/client";

// Force IPv4 connections over HTTPS (port 443) to prevent IPv6 routing timeouts
neonConfig.fetchFunction = function (url: string | URL, options: Record<string, any> = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = typeof url === "string" ? new URL(url) : url;
    const reqOptions: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "POST",
      headers: options.headers || {},
      family: 4,
    };

    const req = https.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          ok: res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false,
          status: res.statusCode || 500,
          statusText: res.statusMessage || "",
          json: () => Promise.resolve(data ? JSON.parse(data) : null),
          text: () => Promise.resolve(data),
        } as any);
      });
    });

    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
};

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeonHttp(connectionString, {
  arrayMode: false,
  fullResults: false,
});
const prisma = new PrismaClient({ adapter });

export { prisma };



