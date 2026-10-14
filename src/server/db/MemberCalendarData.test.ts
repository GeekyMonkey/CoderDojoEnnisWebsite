import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VerifiedMember } from "#server/utils/requestMember";
import { readMemberCalendar, readPublicCalendar } from "./MemberCalendarData";
import { calendarLowerBound, clubToday } from "#shared/utils/CalendarDates";
import type { CoderSession } from "#shared/types/CoderSession";
const mocks = vi.hoisted(() => ({
	pods: vi.fn(),
	publicPods: vi.fn(),
	lower: vi.fn(),
	order: vi.fn(),
}));
vi.mock("./SessionManagementData", (): object => ({
	readSessionManagement: mocks.pods,
}));
vi.mock("./CoderSessionsData", (): object => ({
	readCoderSessions: mocks.publicPods,
}));
const ID: string = "00000000-0000-4000-8000-000000000001";
/** Build a minimal actor whose fluent SELECT chain stands in for the RLS client. */
function actor(isMentor: boolean): VerifiedMember {
	const chain: Record<string, unknown> = {};
	chain.select = (): object => chain;
	chain.eq = (): object => chain;
	chain.gte = mocks.lower.mockImplementation((): object => chain);
	chain.lt = (): object => chain;
	chain.order = mocks.order.mockImplementation((): object => ({
		...chain,
		then: (resolve: (value: object) => void): void =>
			resolve({ data: [], error: null }),
	}));
	return {
		member: { isMentor },
		readClient: { schema: (): object => ({ from: (): object => chain }) },
	} as unknown as VerifiedMember;
}
/** Build a safe active pod without host or joining data. */
function pod(endsAt: number | null): CoderSession {
	return {
		id: ID,
		topic: "Pod",
		sessionDate: clubToday(),
		endsAt,
		url: null,
		hosts: [],
	};
}
beforeEach((): void => {
	vi.resetAllMocks();
	mocks.order.mockResolvedValue({ data: [], error: null });
	mocks.pods.mockResolvedValue({ pods: [] });
	mocks.publicPods.mockResolvedValue([]);
});
describe("Calendar reads", (): void => {
	it("returns no pods or management capability for public readers", async (): Promise<void> => {
		const result = await readPublicCalendar(actor(false).readClient, "future");
		expect(result).toMatchObject({ pods: [], isMentor: false });
		expect(mocks.pods).not.toHaveBeenCalled();
		expect(mocks.publicPods).not.toHaveBeenCalled();
	});
	it("passes an inclusive today/year bound to the RLS read client", async (): Promise<void> => {
		await readMemberCalendar(actor(false), "future");
		expect(mocks.lower).toHaveBeenCalledWith("session_date", clubToday());
		await readMemberCalendar(actor(false), "past");
		expect(mocks.lower).toHaveBeenLastCalledWith(
			"session_date",
			calendarLowerBound(true),
		);
	});
	it("keeps active private mentor pods while removing expired pods and editor snapshots", async (): Promise<void> => {
		mocks.pods.mockResolvedValue({
			pods: [
				{ ...pod(Date.now() + 60_000), fields: { mentorsOnly: true } },
				{ ...pod(Date.now() - 60_000), fields: { mentorsOnly: false } },
			],
		});
		const result: Awaited<ReturnType<typeof readMemberCalendar>> =
			await readMemberCalendar(actor(true), "future");
		expect(result.pods).toHaveLength(1);
		expect(result.pods[0]?.mentorsOnly).toBe(true);
		expect(result.pods[0]).not.toHaveProperty("fields");
		expect(mocks.publicPods).not.toHaveBeenCalled();
	});
	it("uses only the public pod reader for non-mentors", async (): Promise<void> => {
		mocks.publicPods.mockResolvedValue([pod(null)]);
		const result: Awaited<ReturnType<typeof readMemberCalendar>> =
			await readMemberCalendar(actor(false), "past");
		expect(result.pods[0]?.mentorsOnly).toBe(false);
		expect(mocks.pods).not.toHaveBeenCalled();
	});
	it("returns a useful failure rather than an empty calendar on database errors", async (): Promise<void> => {
		const selected: VerifiedMember = actor(false);
		mocks.order.mockImplementation((): object => ({
			order: mocks.order,
			then: (resolve: (value: object) => void): void =>
				resolve({ data: null, error: { message: "unavailable" } }),
		}));
		await expect(readMemberCalendar(selected, "future")).rejects.toMatchObject({
			statusCode: 503,
		});
	});
});
