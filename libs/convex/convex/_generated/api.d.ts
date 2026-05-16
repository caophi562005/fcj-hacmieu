/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bot_agent from "../bot/agent.js";
import type * as bot_cleanup from "../bot/cleanup.js";
import type * as bot_conversations from "../bot/conversations.js";
import type * as bot_files from "../bot/files.js";
import type * as bot_messages from "../bot/messages.js";
import type * as bot_rag from "../bot/rag.js";
import type * as bot_tools_search from "../bot/tools/search.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as messages from "../messages.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "bot/agent": typeof bot_agent;
  "bot/cleanup": typeof bot_cleanup;
  "bot/conversations": typeof bot_conversations;
  "bot/files": typeof bot_files;
  "bot/messages": typeof bot_messages;
  "bot/rag": typeof bot_rag;
  "bot/tools/search": typeof bot_tools_search;
  conversations: typeof conversations;
  crons: typeof crons;
  messages: typeof messages;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
