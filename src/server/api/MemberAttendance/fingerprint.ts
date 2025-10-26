import { defineEventHandler } from "h3";
import { MembersData } from "~~/server/db/MembersData";
import {
	AttendanceService,
	AttendanceServiceError,
} from "~~/server/services/AttendanceService";
import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";

type AttendanceSignInErrorResponse = { error: string };
export default defineEventHandler(
	async (
		event,
	): Promise<AttendanceSignInResponseModel | AttendanceSignInErrorResponse> => {
		// Access the query string from the event object
		const query = event.node.req.url
			? new URL(event.node.req.url, `http://${event.node.req.headers.host}`)
					.searchParams
			: new URLSearchParams();
		const fingerprintId: number = Number(query.get("id") || -1);
		const testing: boolean = Boolean(query.get("testing") === "true");

		const attendanceService = new AttendanceService(event);
		try {
			// Get the member by fingerprint ID
			const member = await MembersData.GetMemberByFingerprintId(
				event,
				fingerprintId,
			);
			if (!member) {
				console.warn(`No member found with fingerprint ID ${fingerprintId}`);
				event.node.res.statusCode = 400;
				return {
					error: `No member found with fingerprint ID ${fingerprintId}`,
				};
			}

			// Do the sign-in
			const response: AttendanceSignInResponseModel =
				await attendanceService.signInMember(member, testing);
			return response;
		} catch (err) {
			if (err instanceof AttendanceServiceError) {
				console.warn(err.message);
				event.node.res.statusCode = 400;
				return { error: err.message };
			}
			console.error("Unexpected sign-in error", err);
			event.node.res.statusCode = 500;
			return { error: "Unexpected error during sign-in" };
		}
	},
);
