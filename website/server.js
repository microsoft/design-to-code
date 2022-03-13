import express from "express";
import path from "path";
import http from "http";

const __dirname = process.cwd();
const app = express();
const outDir = path.join(__dirname, "www");

/**
 * This express file is only for development purposes, the
 * build should be statically served from GitHub pages
 */
app.use("/", express.static(outDir))

http.createServer(app).listen(3000);