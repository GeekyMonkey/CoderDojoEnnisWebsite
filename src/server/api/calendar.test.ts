import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import read from "./calendar.get";
const mocks = vi.hoisted(() => ({
	client: vi.fn(),
	query: vi.fn(),
	read: vi.fn(),
}));
vi.mock("h3", async (original): Promise<unknown> => ({
	...(await original<object>()),
	getQuery: mocks.query,
	setResponseHeader: vi.fn(),
}));
vi.mock("#server/db/DatabaseClient", (): object => ({
	GetSupabaseClient: mocks.client,
}));
vi.mock("#server/db/MemberCalendarData", (): object => ({
	readPublicCalendar: mocks.read,
}));
const EVENT: H3Event = {
	headers: { authorization: "Bearer ignored" },
} as unknown as H3Event;
beforeEach((): void => {
	vi.resetAllMocks();
	mocks.query.mockReturnValue({});
	mocks.client.mockResolvedValue({ anonymous: true });
	mocks.read.mockResolvedValue({ pods: [], isMentor: false });
});
describe("public Calendar API", (): void => {
	it("uses the anonymous client without requiring a logged-in member", async (): Promise<void> => {
		await read(EVENT);
		expect(mocks.client).toHaveBeenCalledWith(EVENT);
		expect(mocks.read).toHaveBeenCalledWith({ anonymous: true }, "future");
	});
	it("accepts the past tab and rejects arbitrary date windows", async (): Promise<void> => {
		mocks.query.mockReturnValue({ view: "past" });
		await read(EVENT);
		expect(mocks.read).toHaveBeenLastCalledWith(expect.anything(), "past");
		mocks.query.mockReturnValue({ view: "all" });
		await expect(read(EVENT)).rejects.toMatchObject({ statusCode: 400 });
	});
	it("reports unavailable storage instead of an empty feed", async (): Promise<void> => {
		mocks.client.mockResolvedValue(null);
		await expect(read(EVENT)).rejects.toMatchObject({ statusCode: 503 });
	});
});
