import {createError,defineEventHandler,type H3Event} from "h3";
import {requireRequestParent} from "#server/utils/parentRequest";
import {maintenanceId,maintenanceBody} from "#server/utils/maintenanceRequest";
import {mutateChild} from "#server/db/ParentChildMaintenanceData";
import {GeneratePasswordHash} from "#server/utils/authUtils";
import {passwordResetSchema,type PasswordReset} from "#shared/types/Parent";
/** Reset a linked child's application credential without exposing its stored hash. */
export default defineEventHandler(async(event:H3Event):Promise<null>=>{
 const actor:Awaited<ReturnType<typeof requireRequestParent>> = await requireRequestParent(event);
 const body:PasswordReset = await maintenanceBody(event,passwordResetSchema);
 const hash:string|null = await GeneratePasswordHash(body.newPassword,useRuntimeConfig(event).private.auth.pass_salt);
 if(!hash)throw createError({statusCode:503,statusMessage:"Unable to reset password"});
 await mutateChild(actor,maintenanceId(event),"password",{password_hash:hash});return null;
});
