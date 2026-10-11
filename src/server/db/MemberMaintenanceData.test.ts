import { describe, expect, it, vi } from "vitest";
import { maintainMember } from "./MemberMaintenanceData";
import type { VerifiedMember } from "#server/utils/requestMember";

describe("maintenance conflict responses", (): void => {
	it.each([["42501", 403], ["P0002", 404], ["40001", 409], ["P0001", 409], ["23505", 409], ["22023", 400], ["XX000", 503]])("maps SQL state %s to HTTP %s", async (code: string, statusCode: number): Promise<void> => {
		const rpc: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue({ data: null, error: { code, message: "conflict" } });
		const actor: VerifiedMember = { id: "actor", client: { schema: (): { rpc: typeof rpc } => ({ rpc }) } } as unknown as VerifiedMember;
		await expect(maintainMember(actor, "account", "member", {})).rejects.toMatchObject({ statusCode });
	});
});
