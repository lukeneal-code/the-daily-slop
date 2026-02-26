import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { SatireResponse } from '../types';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

export async function generateSatire(prompt: string): Promise<SatireResponse> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response (handle potential markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in Claude response: ${text.slice(0, 200)}`);
  }

  const parsed = JSON.parse(jsonMatch[0]) as SatireResponse;

  if (!parsed.headline || !parsed.body || !parsed.imageDescription) {
    throw new Error('Claude response missing required fields');
  }

  return parsed;
}
