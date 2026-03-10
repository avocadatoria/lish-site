import Anthropic from '@anthropic-ai/sdk';

let _client = null;

/**
 * Returns a lazily-initialized Anthropic client singleton.
 */
function getClient() {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

/**
 * Non-streaming chat completion.
 *
 * @param {object} options
 * @param {Array}  options.messages  - Anthropic-formatted messages
 * @param {string} [options.system]  - Optional system prompt
 * @param {number} [options.maxTokens=4096] - Max tokens to generate
 * @returns {Promise<object>} The full Anthropic response
 */
export async function chat({ messages, system, maxTokens = 4096 }) {
  const client = getClient();

  const params = {
    model: `claude-sonnet-4-20250514`,
    max_tokens: maxTokens,
    messages,
  };

  if (system) {
    params.system = system;
  }

  return client.messages.create(params);
}

/**
 * Streaming chat completion.
 *
 * @param {object} options
 * @param {Array}  options.messages  - Anthropic-formatted messages
 * @param {string} [options.system]  - Optional system prompt
 * @param {number} [options.maxTokens=4096] - Max tokens to generate
 * @returns {Promise<Stream>} An Anthropic streaming response
 */
export async function streamChat({ messages, system, maxTokens = 4096 }) {
  const client = getClient();

  const params = {
    model: `claude-sonnet-4-20250514`,
    max_tokens: maxTokens,
    messages,
    stream: true,
  };

  if (system) {
    params.system = system;
  }

  return client.messages.create(params);
}
