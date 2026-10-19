import type { MemberProfileFields } from "#shared/types/MemberProfile";

export type ProfileField = { key: keyof MemberProfileFields; autocomplete: string; type: "text" | "email" | "tel" };
export const PROFILE_FIELDS: ProfileField[] = [
{ key: "nameFirst", autocomplete: "given-name", type: "text" },
{ key: "nameLast", autocomplete: "family-name", type: "text" },
{ key: "email", autocomplete: "email", type: "email" },
{ key: "phone", autocomplete: "tel", type: "tel" },
{ key: "githubLogin", autocomplete: "off", type: "text" },
{ key: "scratchName", autocomplete: "off", type: "text" },
{ key: "xboxGamertag", autocomplete: "off", type: "text" },
];


export type ProfileRoleSubject = { isNinja: boolean; isParent: boolean; isMentor: boolean };

/** Combine fields for all assigned roles while retaining shared identity fields. */
export function profileFieldsForRoles(member: ProfileRoleSubject): ProfileField[] {
 return PROFILE_FIELDS.filter((field: ProfileField): boolean => {
  if (field.key === "nameFirst" || field.key === "nameLast") return true;
  if (field.key === "email" || field.key === "phone") return member.isParent || member.isMentor;
  return member.isNinja || member.isMentor;
 });
}
