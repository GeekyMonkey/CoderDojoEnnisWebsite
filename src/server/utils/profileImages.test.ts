import { Blob, Buffer } from "node:buffer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createError, type H3Event } from "h3";

const mocks = vi.hoisted(() => ({ actor: { id: "00000000-0000-4000-8000-000000000001", client: {} as unknown }, body: {} as unknown, member: { hasPhoto: true, hasAvatar: true }, require: vi.fn(), read: vi.fn(), upload: vi.fn(), remove: vi.fn(), download: vi.fn(), update: vi.fn(), single: vi.fn(), validate: vi.fn() }));
vi.mock("#server/utils/requestMember", () => ({ requireRequestMember: mocks.require }));
vi.mock("#server/db/ProfilesData", () => ({ readProfile: mocks.read }));
vi.mock("./profilePng", () => ({ validateProfilePng: mocks.validate }));
vi.mock("h3", async (original): Promise<object> => ({ ...await original<object>(), getQuery: (): object => ({}), readBody: async (): Promise<unknown> => mocks.body }));
vi.mock("#shared/types/models/MemberModel", () => ({ memberFromRecord: (record: unknown): unknown => record }));
import { changeProfileImages } from "./profileImages";

const event: H3Event = {} as H3Event;
const photo: Blob = new Blob(["photo"], { type: "image/png" });
const avatar: Blob = new Blob(["avatar"], { type: "image/png" });

beforeEach((): void => {
    vi.resetAllMocks();
    mocks.member = { hasPhoto: true, hasAvatar: true };
    const query = { eq: vi.fn(), select: vi.fn(), maybeSingle: mocks.single };
    query.eq.mockReturnValue(query); query.select.mockReturnValue(query);
    mocks.update.mockReturnValue(query); mocks.single.mockResolvedValue({ data: { saved: true }, error: null });
    mocks.actor.client = { storage: { from: (): object => ({ download: mocks.download, upload: mocks.upload, remove: mocks.remove }) }, schema: (): object => ({ from: (): object => ({ update: mocks.update }) }) };
    mocks.require.mockResolvedValue(mocks.actor); mocks.read.mockResolvedValue({ member: mocks.member });
    mocks.upload.mockResolvedValue({ error: null }); mocks.remove.mockResolvedValue({ error: null });
    mocks.validate.mockReturnValue(Buffer.from("processed"));
    mocks.download.mockImplementation(async (path: string): Promise<object> => ({ data: path.endsWith(".png") ? (path.includes("Photos") ? photo : avatar) : null, error: path.endsWith(".jpg") ? { statusCode: "404", message: "Not found" } : null }));
});

describe("authorized profile image persistence", (): void => {
    it("swaps both image contents and flags", async (): Promise<void> => {
        mocks.body = { action: "swap" };
        await changeProfileImages(event, true);
        expect(mocks.upload.mock.calls[0]?.[1]).toBe(avatar);
        expect(mocks.upload.mock.calls[1]?.[1]).toBe(photo);
        expect(mocks.update).toHaveBeenCalledWith({ has_photo: true, has_avatar: true });
    });
    it("moves an image to an empty slot", async (): Promise<void> => {
        mocks.member.hasAvatar = false;
        mocks.body = { action: "swap" };
        await changeProfileImages(event, true);
        expect(mocks.upload).toHaveBeenCalledTimes(1);
        expect(mocks.upload.mock.calls[0]?.[1]).toBe(photo);
        expect(mocks.update).toHaveBeenCalledWith({ has_photo: false, has_avatar: true });
    });
    it("deletes only the requested image and leaves the other flag intact", async (): Promise<void> => {
        mocks.body = { action: "delete", slot: "photo" };
        await changeProfileImages(event, true);
        expect(mocks.upload).not.toHaveBeenCalled();
        expect(mocks.remove.mock.calls[0]?.[0]).toEqual(expect.arrayContaining([expect.stringContaining("Photos/")]));
        expect(mocks.update).toHaveBeenCalledWith({ has_photo: false, has_avatar: true });
    });
    it("rejects unauthorized editing before touching storage", async (): Promise<void> => {
        mocks.body = { action: "delete", slot: "photo" };
        mocks.read.mockRejectedValue(createError({ statusCode: 403 }));
        await expect(changeProfileImages(event, true)).rejects.toMatchObject({ statusCode: 403 });
        expect(mocks.download).not.toHaveBeenCalled();
        expect(mocks.remove).not.toHaveBeenCalled();
    });
    it("validates uploads before modifying storage", async (): Promise<void> => {
        mocks.body = { action: "upload", slot: "avatar", png: "AAAA" };
        await changeProfileImages(event, true);
        expect(mocks.validate).toHaveBeenCalledWith("AAAA");
        expect(mocks.update).toHaveBeenCalledWith({ has_photo: true, has_avatar: true });
    });
    it("restores old images when a swap fails midway", async (): Promise<void> => {
        mocks.body = { action: "swap" };
        mocks.upload.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: new Error("Storage unavailable") });
        await expect(changeProfileImages(event, true)).rejects.toMatchObject({ statusCode: 503 });
        expect(mocks.upload.mock.calls[2]?.[1]).toBe(photo);
        expect(mocks.upload.mock.calls[3]?.[1]).toBe(avatar);
        expect(mocks.update).not.toHaveBeenCalled();
    });
});
