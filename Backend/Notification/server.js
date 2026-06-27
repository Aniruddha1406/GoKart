import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env variables
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...val] = line.trim().split("=");
      if (key && !key.startsWith("#")) process.env[key] = val.join("=");
    });
}

const { default: app } = await import("./src/app.js");

app.listen(3004, () =>
  console.log("Notification service running on port 3004"),
);
