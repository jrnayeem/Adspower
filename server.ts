import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFallbackSpecs(brand?: string, model?: string, userAgent?: string) {
  const ua = (userAgent || '').toLowerCase();
  const b = (brand || '').toLowerCase();
  const m = (model || '').toLowerCase();

  const isIos = ua.includes('iphone') || ua.includes('ipad') || b.includes('apple');
  const isTablet = ua.includes('ipad') || ua.includes('tablet') || m.includes('tab') || m.includes('pad');

  if (isIos) {
    if (isTablet) {
      return {
        brand: 'Apple',
        model: model || 'iPad Pro 11',
        nativeResolution: '1668x2388',
        viewport: '834x1194',
        screenWidth: 834,
        screenHeight: 1194,
        dpr: 2,
        touchPoints: 5,
        ram: '8GB',
        cpuCores: 8,
        deviceType: 'tablet',
        platform: 'ipad',
      };
    }
    return {
      brand: 'Apple',
      model: model || 'iPhone 15 Pro',
      nativeResolution: '1179x2556',
      viewport: '393x852',
      screenWidth: 393,
      screenHeight: 852,
      dpr: 3,
      touchPoints: 5,
      ram: '8GB',
      cpuCores: 6,
      deviceType: 'mobile',
      platform: 'ios',
    };
  }

  // Android
  const brandName = brand && brand !== 'Unknown' ? brand : 'Generic Android';
  const modelName = model && model !== 'Unknown Model' ? model : 'Mobile Device';

  if (isTablet) {
    return {
      brand: brandName,
      model: modelName,
      nativeResolution: '1600x2560',
      viewport: '800x1280',
      screenWidth: 800,
      screenHeight: 1280,
      dpr: 2,
      touchPoints: 10,
      ram: '8GB',
      cpuCores: 8,
      deviceType: 'tablet',
      platform: 'android',
    };
  }

  return {
    brand: brandName,
    model: modelName,
    nativeResolution: '1080x2400',
    viewport: '412x915',
    screenWidth: 412,
    screenHeight: 915,
    dpr: 2.625,
    touchPoints: 10,
    ram: '8GB',
    cpuCores: 8,
    deviceType: 'mobile',
    platform: 'android',
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "AdsPower Profile Generator API" });
  });

  // AI Device Hardware Lookup for unknown models
  app.post("/api/lookup-device", async (req, res) => {
    try {
      const { userAgent, brand, model } = req.body;
      if (!userAgent && !model) {
        return res.status(400).json({ error: "Missing userAgent or model parameter" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Gemini API key not found. Using intelligent heuristic fallback for device lookup.");
        const fallbackData = getFallbackSpecs(brand, model, userAgent);
        return res.json({
          success: true,
          data: fallbackData,
          isFallback: true,
          reason: "API key missing"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Analyze this device specification request:
User Agent: "${userAgent || "N/A"}"
Brand: "${brand || "Unknown"}"
Model: "${model || "Unknown"}"

Find real-world official manufacturer specifications (e.g., GSMArena, Apple, Google Pixel, Samsung specs) for this exact or closest product family device.

Return strict JSON with:
1. brand: Official brand name (e.g., Google, Samsung, Xiaomi, Apple, Motorola, Vivo, Oppo, OnePlus, Sony, Asus, Huawei, Honor, Nothing, Tecno, Infinix, Lenovo, Realme)
2. model: Official device model string (e.g., Pixel 9, Galaxy S24 Ultra, iPhone 15 Pro, Redmi Note 13 Pro)
3. nativeResolution: Resolution formatted strictly as "WIDTHxHEIGHT" (e.g., "1080x2424", "1440x3120", "1179x2556", "1290x2796")
4. viewport: Viewport dimensions formatted as "WIDTHxHEIGHT" (e.g., "412x915", "393x852", "430x932")
5. screenWidth: CSS screen width number (e.g., 412, 393, 430)
6. screenHeight: CSS screen height number (e.g., 915, 852, 932)
7. dpr: Device Pixel Ratio number (e.g. 2.625, 3.0, 2.0)
8. touchPoints: Max touch points (e.g. 5 or 10)
9. ram: Typical RAM (e.g. "8GB", "12GB", "6GB")
10. cpuCores: Core count (e.g. 8)
11. deviceType: "mobile" or "tablet"
12. platform: "android" or "ios" or "ipad"`;

      const requestConfig = {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING },
              model: { type: Type.STRING },
              nativeResolution: { type: Type.STRING },
              viewport: { type: Type.STRING },
              screenWidth: { type: Type.INTEGER },
              screenHeight: { type: Type.INTEGER },
              dpr: { type: Type.NUMBER },
              touchPoints: { type: Type.INTEGER },
              ram: { type: Type.STRING },
              cpuCores: { type: Type.INTEGER },
              deviceType: { type: Type.STRING },
              platform: { type: Type.STRING },
            },
            required: [
              "brand",
              "model",
              "nativeResolution",
              "viewport",
              "screenWidth",
              "screenHeight",
              "dpr",
              "touchPoints",
              "ram",
              "cpuCores",
              "deviceType",
              "platform",
            ],
          },
        },
      };

      // Helper function with retries and model fallbacks
      let responseText = "";
      const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.6-flash",
      ];

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            ...requestConfig,
          });
          if (response.text) {
            responseText = response.text.trim();
            break;
          }
        } catch (apiErr: any) {
          const errMsg = apiErr?.message || String(apiErr);
          console.warn(`Model ${modelName} call skipped: ${errMsg.slice(0, 150)}`);
        }
        if (responseText) break;
      }

      if (!responseText) {
        console.warn("All Gemini AI attempts failed or returned empty. Falling back to heuristic hardware specs.");
        const fallbackData = getFallbackSpecs(brand, model, userAgent);
        return res.json({
          success: true,
          data: fallbackData,
          isFallback: true,
          reason: "Gemini AI unavailable or overloaded"
        });
      }

      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error("Error looking up device hardware:", err);
      const fallbackData = getFallbackSpecs(req.body.brand, req.body.model, req.body.userAgent);
      return res.json({
        success: true,
        data: fallbackData,
        isFallback: true,
        reason: "Exception during lookup fallback"
      });
    }
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AdsPower Generator Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
