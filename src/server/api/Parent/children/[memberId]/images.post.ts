import {defineEventHandler,type H3Event} from "h3";
import {changeProfileImages} from "#server/utils/profileImages";
import {childMemberSchema,type ChildMember} from "#shared/types/Parent";
/** Reuse image validation, crop output handling and rollback for a linked child's images. */
export default defineEventHandler(async(event:H3Event):Promise<ChildMember>=>childMemberSchema.parse(await changeProfileImages(event,false,true)));
