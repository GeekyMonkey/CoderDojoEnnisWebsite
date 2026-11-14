import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp, defineEventHandler, toNodeListener, type H3Event } from "h3";
import { describe, expect, it, vi } from "vitest";
import { accountUpdateSchema, newAccount, type AccountFields } from "#shared/types/MemberMaintenance";
import { requestFailureFields, requestFailureMessage } from "#shared/utils/RequestFailure";
import type { ValidationFieldError } from "#shared/utils/ValidationErrors";
import { maintenanceBody } from "./maintenanceRequest";
vi.mock("./requestMentor", (): object => ({ requireRequestMentor: vi.fn() }));

describe("maintenance validation HTTP boundary", (): void => {
	it("returns invalid fields through HTTP without exposing submitted values", async (): Promise<void> => {
		const app: ReturnType<typeof createApp> = createApp();
		app.use(defineEventHandler(async (event: H3Event): Promise<unknown> => maintenanceBody(event, accountUpdateSchema)));
		const server: Server = createServer(toNodeListener(app));
		await new Promise<void>((resolve: () => void): void => { server.listen(0, "127.0.0.1", resolve); });
		try {
			const address: AddressInfo = server.address() as AddressInfo;
			const expected: AccountFields = newAccount("coder");
			const response: Response = await fetch(`http://127.0.0.1:${address.port}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: { ...expected, birthYear: 2007.5, fingerprintId: -1, password: "never-return-this-value" }, expected }) });
			const body: unknown = await response.json();
			const failure: unknown = { data: body };
			expect(response.status).toBe(400);
			expect(requestFailureFields(failure).map((error: ValidationFieldError): string => error.name)).toEqual(["birthYear", "fingerprintId", "password"]);
			expect(requestFailureMessage(failure)).toContain("Birth year:");
			expect(requestFailureMessage(failure)).toContain("Fingerprint id:");
			expect(JSON.stringify(body)).not.toContain("never-return-this-value");
		} finally { await new Promise<void>((resolve: () => void): void => { server.close((): void => resolve()); }); }
	});
});
