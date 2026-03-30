import express from "express";
import { db } from "./db.js";
import { conversations, messages } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || "3001", 10);

// --- Conversations ---

app.get("/api/conversations", async (_req, res) => {
  try {
    const data = await db
      .select({ id: conversations.id, title: conversations.title, model: conversations.model })
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
      .limit(10);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const { title, model } = req.body;
    const [conv] = await db
      .insert(conversations)
      .values({ title: title || "New Conversation", model })
      .returning();
    res.json(conv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const [conv] = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    res.json(conv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(conversations).where(eq(conversations.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Messages ---

app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db
      .select({ id: messages.id, role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, content } = req.body;
    const [msg] = await db
      .insert(messages)
      .values({ conversationId: id, role, content })
      .returning();
    res.json(msg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(messages).where(eq(messages.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Chat (proxy to OpenRouter) ---

app.post("/api/chat", async (req, res) => {
  try {
    const { model, messages: chatMessages } = req.body;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      res.status(500).json({ error: "OpenRouter API key not configured" });
      return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.REPLIT_DEV_DOMAIN
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "https://replit.com",
        "X-Title": "AI Chat App",
      },
      body: JSON.stringify({ model, messages: chatMessages, stream: true }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      res.status(response.status).json({ error: `OpenRouter API error: ${errorData}` });
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
