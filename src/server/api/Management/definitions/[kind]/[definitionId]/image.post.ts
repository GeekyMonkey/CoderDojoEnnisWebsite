import { createError, defineEventHandler, getRouterParam, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { changeEntityImage } from "#server/utils/entityImages";
import { categoryDefinition } from "#server/db/DefinitionMaintenanceData";
import { definitionIdSchema, type Definition } from "#shared/types/DefinitionMaintenance";
import type { BadgeCategoryRecord } from "#shared/types/models/BadgeCategoryModel";
import { entityImageActionSchema, type EntityImageAction } from "#shared/types/ImageUpload";
/** Validate a mentor's category image request and return its refreshed definition. */
export default defineEventHandler(async (event: H3Event): Promise<Definition> => {
 if (getRouterParam(event, "kind") !== "category") throw createError({ statusCode: 404, statusMessage: "Image entity not found" });
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const identity: ReturnType<typeof definitionIdSchema.safeParse> = definitionIdSchema.safeParse(getRouterParam(event,"definitionId"));
 if (!identity.success) throw createError({ statusCode:400,statusMessage:"Invalid category ID" });
 const action: EntityImageAction = await maintenanceBody(event,entityImageActionSchema);
 return categoryDefinition(await changeEntityImage(actor,"category",identity.data,action) as BadgeCategoryRecord);
});
