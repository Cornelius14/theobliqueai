import type { Parsed } from './llmClient';
import { synthProspects } from './synth';

export function seedProspects(parsed: Parsed) {
  return synthProspects(parsed, 10);
}