import { groq } from '@ai-sdk/groq';
import type { LanguageModel } from 'ai';

export const CHAT_MODEL: LanguageModel = groq('openai/gpt-oss-120b');

export const EXTRACT_MODEL: LanguageModel = groq('openai/gpt-oss-120b');
