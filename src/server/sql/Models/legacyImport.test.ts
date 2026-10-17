import { describe, expect, it } from "vitest";
import { FromLegacyMemberEntity, type LegacyMemberEntity } from "./LegacyMemberEntity";
import { FromLegacyAdultEntity, type LegacyAdultEntity } from "./LegacyAdultEntity";
import { FromLegacyAdultBadgeCategoryEntity } from "./LegacyAdultBadgeCategoryEntity";
import { MemberModelSchema } from "#shared/types/models/MemberModel";

const CODER: LegacyMemberEntity = { Id: "00000000-0000-4000-8000-000000000001", Deleted: false, BirthYear: 2010, FingerprintId: null, FirstName: "Coder", GithubLogin: null, GoalLongTerm: null, GoalShortTerm: null, LastName: "Test", Login: "coder", LoginDate: null, LoginDatePrevious: null, PasswordHash: null, RegisteredCurrentTerm: false, ScratchName: null, TeamId: null, XboxGamertag: null };
const ADULT: LegacyAdultEntity = { ...CODER, Email: null, Phone: null, GardaVetted: false, IsMentor: true, IsParent: false };
describe("legacy import mappings", (): void => {
 it("supplies NFC defaults required by the current account schema", (): void => {
  expect(MemberModelSchema.parse(FromLegacyMemberEntity(CODER)).nfcTag).toBeNull();
  expect(MemberModelSchema.parse(FromLegacyAdultEntity(ADULT)).nfcTag).toBeNull();
 });
 it("maps mentor skills from the legacy AdultId column", (): void => {
  expect(FromLegacyAdultBadgeCategoryEntity({ Id: "skill", AdultId: ADULT.Id, BadgeCategoryId: "category" })).toEqual({ id: "skill", memberId: ADULT.Id, badgeCategoryId: "category" });
 });
});
