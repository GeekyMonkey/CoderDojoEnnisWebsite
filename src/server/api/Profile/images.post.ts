import { defineEventHandler, type H3Event } from "h3";
import { changeProfileImages } from "#server/utils/profileImages";
import type { MemberModel } from "#shared/types/models/MemberModel";

/** Update authorized profile images through the shared persistence handler. */
export default defineEventHandler((event: H3Event): Promise<MemberModel> => changeProfileImages(event, true));
