import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import list from "./index.get";
import join from "./join.post";
import create from "../../Management/calendar-sessions/index.post";
import save from "../../Management/calendar-sessions/[memberId].patch";
import remove from "../../Management/calendar-sessions/[memberId].delete";
import read from "../../Management/calendar-sessions/[memberId].get";

const mocks = vi.hoisted(() => ({
	member: vi.fn(),
	mentor: vi.fn(),
	query: vi.fn(),
	calendar: vi.fn(),
	write: vi.fn(),
	join: vi.fn(),
	body: vi.fn(),
	id: vi.fn(),
}));
vi.mock("h3", async (original): Promise<unknown> => ({
	...(await original<object>()),
	getQuery: mocks.query,
	setResponseHeader: vi.fn(),
}));
vi.mock("#server/utils/requestMember", (): object => ({
	requireRequestMember: mocks.member,
}));
vi.mock("#server/utils/maintenanceRequest", (): object => ({
	maintenanceActor: mocks.mentor,
	maintenanceBody: mocks.body,
	maintenanceId: mocks.id,
}));
vi.mock("#server/db/MemberCalendarData", (): object => ({
	readMemberCalendar: mocks.calendar,
	maintainCalendarSession: mocks.write,
}));
vi.mock("#server/db/CoderSessionsData", (): object => ({
	joinOwnSession: mocks.join,
}));
const EVENT: H3Event = {} as H3Event;
beforeEach((): void => {
	vi.resetAllMocks();
	mocks.member.mockResolvedValue({
		member: { isMentor: false, isParent: false, isNinja: true },
	});
	mocks.query.mockReturnValue({});
	mocks.calendar.mockResolvedValue({});
});
describe("shared Calendar API boundaries", (): void => {
	it.each(["isMentor", "isParent", "isNinja"])(
		"accepts the current %s role without attendance",
		async (role: string): Promise<void> => {
			mocks.member.mockResolvedValue({ member: { [role]: true } });
			await list(EVENT);
			expect(mocks.calendar).toHaveBeenCalledWith(
				{ member: { [role]: true } },
				"future",
			);
		},
	);
	it("validates a tab view instead of accepting arbitrary dates", async (): Promise<void> => {
		mocks.query.mockReturnValue({ view: "past" });
		await list(EVENT);
		expect(mocks.calendar).toHaveBeenLastCalledWith(expect.anything(), "past");
		mocks.query.mockReturnValue({ dateMin: "1900-01-01" });
		await expect(list(EVENT)).rejects.toMatchObject({ statusCode: 400 });
	});
	it.each([list, join])(
		"rejects a roleless identity",
		async (handler): Promise<void> => {
			mocks.member.mockResolvedValue({ member: {} });
			await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 403 });
		},
	);
	it.each([list, join])(
		"rejects an expired or signed-out request",
		async (handler): Promise<void> => {
			mocks.member.mockRejectedValue({ statusCode: 401 });
			await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 401 });
		},
	);
	it.each([create, save, remove, read])(
		"requires verified mentor authority for every management endpoint",
		async (handler): Promise<void> => {
			mocks.mentor.mockRejectedValue({ statusCode: 403 });
			await expect(handler(EVENT)).rejects.toMatchObject({ statusCode: 403 });
			expect(mocks.write).not.toHaveBeenCalled();
		},
	);
});
