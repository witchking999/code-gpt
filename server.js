import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import compression from "compression";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install({
  retrieveSourceMap: function (source) {
    const match = source.startsWith("file://");
    if (match) {
      const filePath = url.fileURLToPath(source);
      const sourceMapPath = `${filePath}.map`;
      if (fs.existsSync(sourceMapPath)) {
        return {
          url: source,
          map: fs.readFileSync(sourceMapPath, "utf8"),
        };
      }
    }
    return null;
  },
});
installGlobals();

/** @typedef {import('@remix-run/node').ServerBuild} ServerBuild */

const BUILD_PATH = path.resolve("build/index.js");
const VERSION_PATH = path.resolve("build/version.txt");

const initialBuild = await reimportServer();
const remixHandler =
  process.env.NODE_ENV === "development"
    ? await createDevRequestHandler(initialBuild)
    : createRequestHandler({ build: initialBuild });

const app = express();

app.use(cors()); // Use CORS for cross-origin requests

app.use(compression());

app.disable("x-powered-by");

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

// Import all routes from routes/api
fs.readdirSync(path.join(__dirname, 'routes/api')).forEach(file => {
  const route = require(path.join(__dirname, 'routes/api', file));
  app.use('/api', route);
});

app.all("*", remixHandler);

const port = 8000; // Change the port to 8000
app.listen(port, async () => {
  console.log(`Express server listening at http://localhost:${port}`);

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(initialBuild);
  }
});

async function reimportServer() {
  const stat = fs.statSync(BUILD_PATH);

  const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  return import(BUILD_URL + "?t=" + stat.mtimeMs);
}

async function createDevRequestHandler(initialBuild) {
  let build = initialBuild;
  async function handleServerUpdate() {
    build = await reimportServer();
    broadcastDevReady(build);
  }
  const chokidar = await import("chokidar");
  chokidar
    .watch(VERSION_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}