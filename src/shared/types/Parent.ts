import { z } from "zod";
import { MemberModelSchema, type MemberModel } from "./models/MemberModel";
import { TeamModelSchema, type TeamModel } from "./models/TeamModel";
import { BeltModelSchema, type BeltModel } from "./models/BeltModel";
import { publicMemberSchema, type PublicMember } from "./Coder";
import { profileEditableFieldsSchema, type ProfileEditableFields } from "./MemberProfile";

export const childMemberSchema:z.ZodType<ChildMember> = MemberModelSchema.pick({ id:true, nameFirst:true, nameLast:true, birthYear:true, login:true, githubLogin:true, scratchName:true, xboxGamertag:true, hasPhoto:true, hasAvatar:true, isMentor:true, isNinja:true, isParent:true, teamId:true, goalShortTerm:true, goalLongTerm:true }).strip();
export type ChildMember = Pick<MemberModel,"id"|"nameFirst"|"nameLast"|"birthYear"|"login"|"githubLogin"|"scratchName"|"xboxGamertag"|"hasPhoto"|"hasAvatar"|"isMentor"|"isNinja"|"isParent"|"teamId"|"goalShortTerm"|"goalLongTerm">;
export const childSummarySchema:z.ZodType<ChildSummary> = z.strictObject({ member:childMemberSchema, currentBelt:BeltModelSchema.nullable(), attendanceCount:z.number().int().nonnegative() });
export type ChildSummary = { member:ChildMember; currentBelt:BeltModel|null; attendanceCount:number };
export const parentContactSchema:z.ZodType<ParentContact> = MemberModelSchema.pick({ id:true, nameFirst:true, nameLast:true, email:true, phone:true }).strip();
export type ParentContact = Pick<MemberModel,"id"|"nameFirst"|"nameLast"|"email"|"phone">;
export const parentChildSchema:z.ZodType<ParentChild> = z.strictObject({ member:childMemberSchema, currentBelt:BeltModelSchema.nullable(), attendanceCount:z.number().int().nonnegative(), team:TeamModelSchema.nullable(), roster:z.array(publicMemberSchema), parents:z.array(parentContactSchema) });
export type ParentChild = ChildSummary & {team:TeamModel|null;roster:PublicMember[];parents:ParentContact[]};
export const childFieldsSchema:z.ZodType<ChildFields> = profileEditableFieldsSchema.pick({ login:true, githubLogin:true, scratchName:true, xboxGamertag:true }).extend({ birthYear:z.number().int().min(1900).max(new Date().getUTCFullYear()).nullable() });
export type ChildFields = Pick<ProfileEditableFields,"login"|"githubLogin"|"scratchName"|"xboxGamertag"> & {birthYear:number|null};
export const childSnapshotSchema:z.ZodType<ChildSnapshot> = MemberModelSchema.pick({ birthYear:true, login:true, githubLogin:true, scratchName:true, xboxGamertag:true }).strict();
export type ChildSnapshot = Omit<ChildFields,"login"> & {login:string|null};
export const childUpdateSchema:z.ZodType<ChildUpdate> = z.strictObject({ fields:childFieldsSchema, expected:childSnapshotSchema });
export const childFormSchema:z.ZodType<ChildSnapshot> = childSnapshotSchema.superRefine((value:ChildSnapshot,context:z.RefinementCtx):void=>{const parsed:z.ZodSafeParseResult<ChildFields> = childFieldsSchema.safeParse(value);if(!parsed.success)for(const issue of parsed.error.issues)context.addIssue({code:"custom",path:issue.path,message:issue.message});});
export type ChildUpdate = {fields:ChildFields;expected:ChildSnapshot};
export { selectedPasswordResetSchema as passwordResetSchema, selectedPasswordResetFormSchema as passwordResetFormSchema } from "./MemberProfile";
export type { SelectedPasswordReset as PasswordReset } from "./MemberProfile";
/** Extract the complete narrow editable baseline without role or authentication fields. */
export function childSnapshot(member:ChildMember):ChildSnapshot { return childSnapshotSchema.parse({ birthYear:member.birthYear, login:member.login, githubLogin:member.githubLogin, scratchName:member.scratchName, xboxGamertag:member.xboxGamertag }); }
