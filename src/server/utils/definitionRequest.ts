import { createError, getRouterParam, type H3Event } from "h3";
import { definitionKindSchema, definitionIdSchema, type DefinitionKind } from "#shared/types/DefinitionMaintenance";
/** Validate the selected definition kind before choosing its contract or table. */
export function definitionKind(event: H3Event): DefinitionKind { const parsed: ReturnType<typeof definitionKindSchema.safeParse> = definitionKindSchema.safeParse(getRouterParam(event,"kind")); if(!parsed.success) throw createError({statusCode:400,statusMessage:"Invalid definition kind"}); return parsed.data; }
/** Validate the selected definition identity. */
export function definitionId(event: H3Event): string { const parsed: ReturnType<typeof definitionIdSchema.safeParse> = definitionIdSchema.safeParse(getRouterParam(event,"definitionId")); if(!parsed.success) throw createError({statusCode:400,statusMessage:"Invalid definition ID"}); return parsed.data; }
