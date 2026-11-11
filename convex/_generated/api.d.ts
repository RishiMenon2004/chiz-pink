/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as backups from "../backups.js";
import type * as crons from "../crons.js";
import type * as gachaBackups from "../gachaBackups.js";
import type * as http from "../http.js";
import type * as importDropRefs from "../importDropRefs.js";
import type * as importDrops from "../importDrops.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  backups: typeof backups;
  crons: typeof crons;
  gachaBackups: typeof gachaBackups;
  http: typeof http;
  importDropRefs: typeof importDropRefs;
  importDrops: typeof importDrops;
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

export declare const components: {};
