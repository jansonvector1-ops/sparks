import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { db } from "./db.js";
import { conversations, messages } from "../shared/schema.js";
import { eq, desc, and } from "drizzle-orm";
import {
  authMiddleware,
  requireAuth,
  requireAdmin,
  verifyAuthToken,
  logoutUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  deleteUserAsAdmin,
  getAdminLogs,
} from "./auth.js";

const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
const PORT = parseInt(process.env.PORT || "3001", 10);

// --- Public Auth Endpoints (no auth required) ---

app.post("/api/auth/verify", authMiddleware, verifyAuthToken);
app.post("/api/auth/logout", logoutUser);

// --- Protected API Routes ---
// Apply auth middleware to all remaining /api routes
app.use("/api", authMiddleware);

// --- User Profile Endpoints ---

app.get("/api/user/profile", getUserProfile);
app.patch("/api/user/profile", updateUserProfile);
app.delete("/api/user/account", deleteUserAccount);
app.post("/api/user/change-password", changePassword);

// --- Admin Endpoints ---

app.get("/api/admin/users", requireAdmin, getAllUsers);
app.delete("/api/admin/users/:id", requireAdmin, deleteUserAsAdmin);
app.get("/api/admin/logs", requireAdmin, getAdminLogs);

// --- Conversations ---

app.get("/api/conversations", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const data = await db
      .select({ id: conversations.id, title: conversations.title, model: conversations.model })
      .from(conversations)
      .where(eq(conversations.user_id, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(10);
    res.json(data);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, model } = req.body;
    const [conv] = await db
      .insert(conversations)
      .values({ user_id: userId, title: title || "New Conversation", model })
      .returning();
    res.json(conv);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.patch("/api/conversations/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { title } = req.body;

    // Verify ownership
    const existing = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.user_id, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this conversation' });
    }

    const [conv] = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    res.json(conv);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.delete("/api/conversations/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    // Verify ownership
    const existing = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.user_id, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this conversation' });
    }

    await db.delete(conversations).where(eq(conversations.id, id));
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// --- Messages ---

app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    // Verify ownership
    const conv = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.user_id, userId)))
      .limit(1);

    if (conv.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    const data = await db
      .select({ id: messages.id, role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json(data);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post("/api/conversations/:id/messages", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { role, content, messageId } = req.body;

    // Verify ownership
    const conv = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.user_id, userId)))
      .limit(1);

    if (conv.length === 0) {
      return res.status(403).json({ error: 'Not authorized to add messages to this conversation' });
    }

    const [msg] = await db
      .insert(messages)
      .values({ id: messageId, user_id: userId, conversationId: id, role, content })
      .returning();

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));

    res.json(msg);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    // Verify ownership
    const msg = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), eq(messages.user_id, userId)))
      .limit(1);

    if (msg.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await db.delete(messages).where(eq(messages.id, id));
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// --- Free Models from OpenRouter ---

app.get("/api/models", async (_req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "OpenRouter API key not configured" });
      return;
    }
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch models from OpenRouter" });
      return;
    }

    const data: {
      data?: {
        id: string;
        name: string;
        context_length: number;
        pricing?: { prompt: string; completion: string };
        supported_parameters?: string[];
        top_provider?: { is_moderated: boolean };
      }[]
    } = await response.json();

    const free = (data.data ?? []).filter((m) => {
      // Must be free
      const isFree = m.pricing?.prompt === "0" && m.pricing?.completion === "0";
      if (!isFree) return false;

      // Must have supported_parameters (means endpoint exists)
      const params = m.supported_parameters ?? [];
      const hasEndpoint = Array.isArray(params) && params.length > 0;
      if (!hasEndpoint) return false;

      // Must support basic chat (temperature param = real chat model)
      const supportsChat = params.includes("temperature");
      if (!supportsChat) return false;

      return true;
    });

    res.json(free);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// --- AI Chat (proxy to OpenRouter) ---

app.post("/api/chat", async (req, res) => {
  try {
    const { model, messages: chatMessages, temperature, top_p, max_tokens, presence_penalty, frequency_penalty } = req.body;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey || openRouterApiKey.includes("your_")) {
      res.status(400).json({ error: "OpenRouter API key not configured properly. Please set OPENROUTER_API_KEY in .env" });
      return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
"HTTP-Referer": process.env.FRONTEND_URL || "https://sparks-production-780a.up.railway.app",
        "X-Title": "Sparks AI Chat",
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: true,
        temperature: temperature || 0.7,
        top_p: top_p || 0.9,
        ...(max_tokens && { max_tokens }),
        ...(presence_penalty !== undefined && { presence_penalty }),
        ...(frequency_penalty !== undefined && { frequency_penalty }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let friendlyError = "The AI service returned an error. Please try again.";
      try {
        const parsed = JSON.parse(errorText);
        const msg: string = parsed?.error?.message ?? "";
        const code: number = parsed?.error?.code ?? response.status;
        if (code === 429 || msg.toLowerCase().includes("rate")) {
          friendlyError = "This model is currently rate-limited. Please try a different model or wait a moment.";
        } else if (code === 404 || msg.toLowerCase().includes("no endpoint")) {
          friendlyError = "This model is not currently available. Please select a different model.";
        } else if (msg) {
          friendlyError = msg;
        }
      } catch {
        // ignore JSON parsing errors
      }
      console.error("OpenRouter error:", errorText);
      res.status(response.status).json({ error: friendlyError });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../../dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../dist/index.html"));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
