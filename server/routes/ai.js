import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, generateText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI routes plugin.
 *
 * Provides streaming and non-streaming AI chat endpoints under /api/ai/*.
 */
export default async function aiRoutes(fastify) {
  // ── POST /api/ai/chat ──────────────────────────────────
  // Streaming chat via Server-Sent Events using the Vercel AI SDK.
  fastify.post(`/api/ai/chat`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const { messages, system } = request.body;

    const result = streamText({
      model: anthropic(`claude-sonnet-4-20250514`),
      messages,
      system,
    });

    reply.raw.writeHead(200, {
      'Content-Type': `text/plain; charset=utf-8`,
      'X-Vercel-AI-Data-Stream': `v1`,
      'Cache-Control': `no-cache`,
      Connection: `keep-alive`,
    });

    const stream = (await result).toDataStream();

    for await (const chunk of stream) {
      reply.raw.write(chunk);
    }

    reply.raw.end();
  });

  // ── POST /api/ai/generate ──────────────────────────────
  // Non-streaming text generation.
  fastify.post(`/api/ai/generate`, {
    preHandler: [fastify.requireAuth],
  }, async (request) => {
    const { messages, system } = request.body;

    const { text } = await generateText({
      model: anthropic(`claude-sonnet-4-20250514`),
      messages,
      system,
    });

    return { content: text };
  });
}
