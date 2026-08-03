import swaggerJsdoc from "swagger-jsdoc";
import config from "./index";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FixItNow API",
      version: "1.0.0",
      description: "API documentation for FixItNow service marketplace backend",
    },
    servers: [
      {
        url: config.backendUrl || `http://localhost:${config.port}`,
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "HTTP-only JWT access token cookie",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    "./src/modules/**/*.route.ts",
    "./src/app.ts",
    "./dist/modules/**/*.route.js",
    "./dist/app.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
