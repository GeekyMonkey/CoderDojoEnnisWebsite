import { describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { requireRequestMentor } from "./requestMentor";

const verify: ReturnType<typeof vi.fn> = vi.hoisted((): ReturnType<typeof vi.fn> => vi.fn());
vi.mock("./requestMember", (): object => ({ requireRequestMember: verify }));
const EVENT: H3Event = {} as H3Event;

describe("mentor role authorization", (): void => {
	it("rejects a verified member without the mentor role", async (): Promise<void> => {
		verify.mockResolvedValue({ id: "member", member: { isMentor: false } });
		await expect(requireRequestMentor(EVENT)).rejects.toMatchObject({ statusCode: 403 });
	});
	it("returns a verified mentor", async (): Promise<void> => {
		verify.mockResolvedValue({ id: "mentor", member: { isMentor: true } });
		await expect(requireRequestMentor(EVENT)).resolves.toMatchObject({ id: "mentor" });
	});
});
