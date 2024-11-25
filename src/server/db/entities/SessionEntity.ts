import { SessionModel } from "~~/shared/types/SessionModel";
import { sessions } from "../schema/schemas";

export type SessionEntity = typeof sessions.$inferSelect;

export const ToSessionModel = (entity: SessionEntity): SessionModel => {
	return {
		...entity,
		createdDate: entity.createdDate.getTime(),
		endDate: entity.endDate ? entity.endDate.getTime() : null,
	};
};
