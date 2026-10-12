import { coderContextSchema, type CoderContext } from "#shared/types/Coder";
import { useCoderQuery, type CoderQuery } from "./useCoderQuery";
/** Own the logged-in coder's team and profile context. */
export function useCoderContextStore():CoderQuery<CoderContext> { return useCoderQuery("context",coderContextSchema); }
