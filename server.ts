import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase body limit to handle large HTML files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route to save a generated newsletter file
  app.post("/api/save-newsletter", (req, res) => {
    const { filename, htmlContent } = req.body;

    if (!filename || !htmlContent) {
      return res.status(400).json({ error: "Missing filename or htmlContent" });
    }

    // Clean up filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    if (!safeFilename.endsWith(".html")) {
      return res.status(400).json({ error: "Invalid file format. Must be .html" });
    }

    const filePath = path.join(process.cwd(), safeFilename);

    try {
      fs.writeFileSync(filePath, htmlContent, "utf8");
      console.log(`Saved newsletter: ${safeFilename} at ${filePath}`);
      return res.json({ success: true, filename: safeFilename, path: filePath });
    } catch (err: any) {
      console.error("Failed to save newsletter:", err);
      return res.status(500).json({ error: `Failed to save file: ${err.message}` });
    }
  });

  // API Route to read files for preview/loading
  app.get("/api/get-newsletter/:filename", (req, res) => {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      return res.send(content);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Serve static assets or use Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
