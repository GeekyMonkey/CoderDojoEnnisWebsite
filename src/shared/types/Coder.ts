import { z } from "zod";
import { MemberModelSchema } from "./models/MemberModel";
import { TeamModelSchema } from "./models/TeamModel";
import { AchievementReviewSchema } from "./AchievementReview";

export const publicMemberSchema = MemberModelSchema.pick({ id:true, birthYear:true, nameFirst:true, nameLast:true, hasPhoto:true, hasAvatar:true, githubLogin:true, scratchName:true, xboxGamertag:true, isNinja:true, isMentor:true, isParent:true }).strip();
export type PublicMember = z.infer<typeof publicMemberSchema>;
export const publicAwardSchema = AchievementReviewSchema.pick({ id:true, kind:true, label:true, categoryName:true, belt:true, description:true, awarded:true, definitionDeleted:true, sortOrder:true }).strip();
export type PublicAward = z.infer<typeof publicAwardSchema>;
export const coderContextSchema = z.strictObject({ member:MemberModelSchema, team:TeamModelSchema.nullable(), roster:z.array(publicMemberSchema) });
export type CoderContext = z.infer<typeof coderContextSchema>;
export const teamMemberProfileSchema = z.strictObject({ member:publicMemberSchema, team:TeamModelSchema, roster:z.array(publicMemberSchema), awards:z.array(publicAwardSchema) });
export type TeamMemberProfile = z.infer<typeof teamMemberProfileSchema>;
