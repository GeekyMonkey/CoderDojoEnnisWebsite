import { describe, expect, it } from "vitest";
import { imageGeometry, clampImageTransform, zoomImageTransform, profileImageActionSchema, type ImageGeometry, type ImageTransform, type ImagePoint } from "./ProfileImages";
const INITIAL: ImageTransform = { zoom: 1, panX: 0, panY: 0 };

describe("profile image framing", (): void => {
    it("fits a rectangle and limits the saved square to 800 pixels", (): void => {
        expect(imageGeometry(1600, 900, INITIAL, false)).toEqual({ outputSize: 800, x: 0, y: 175, width: 800, height: 450 });
        expect(imageGeometry(100, 200, INITIAL, false)).toEqual({ outputSize: 200, x: 50, y: 0, width: 100, height: 200 });
    });
    it("initially fits the entire photo inside the circular display", (): void => {
        const geometry: ImageGeometry = imageGeometry(1600, 900, INITIAL, true);
        expect(Math.hypot(geometry.width, geometry.height)).toBeCloseTo(800);
    });
    it("automatically exposes transparent padding when zooming out", (): void => {
        expect(imageGeometry(1600, 900, { zoom: 0.5, panX: 0.1, panY: -0.1 }, false)).toEqual({ outputSize: 800, x: 280, y: 207.5, width: 400, height: 225 });
    });
    it("keeps the image point under the cursor fixed during wheel zoom", (): void => {
        const initial: ImageTransform = { zoom: 1.3, panX: 0.1, panY: -0.1 };
        const anchor: ImagePoint = { x: 0.2, y: 0.8 };
        const next: ImageTransform = zoomImageTransform(initial, 2.6, anchor);
        expect((anchor.x - 0.5 - next.panX) / next.zoom).toBeCloseTo((anchor.x - 0.5 - initial.panX) / initial.zoom);
        expect((anchor.y - 0.5 - next.panY) / next.zoom).toBeCloseTo((anchor.y - 0.5 - initial.panY) / initial.zoom);
    });
    it("combines pinch zoom and midpoint movement without a jump", (): void => {
        const next: ImageTransform = zoomImageTransform(INITIAL, 2, { x: 0.5, y: 0.5 }, { x: 0.6, y: 0.4 });
        expect(next.panX).toBeCloseTo(0.1); expect(next.panY).toBeCloseTo(-0.1);
        expect(zoomImageTransform(next, 2, { x: 0.3, y: 0.4 }, { x: 0.4, y: 0.5 }).panX).toBeCloseTo(0.2);
    });
    it("bounds zoom and prevents dragging the entire image outside the square", (): void => {
        expect(clampImageTransform(800, 800, { zoom: 0.001, panX: 100, panY: -100 }, false)).toEqual({ zoom: 0.25, panX: 0.575, panY: -0.575 });
        expect(clampImageTransform(800, 800, { zoom: 100, panX: 0, panY: 0 }, false).zoom).toBe(8);
    });
    it("rejects unknown slots and unexpected action fields", (): void => {
        expect(profileImageActionSchema.safeParse({ action: "delete", slot: "other" }).success).toBe(false);
        expect(profileImageActionSchema.safeParse({ action: "swap" }).success).toBe(false);
        expect(profileImageActionSchema.safeParse({ action: "copyAvatarToPhoto", memberId: "someone" }).success).toBe(false);
        expect(profileImageActionSchema.safeParse({ action: "copyAvatarToPhoto" }).success).toBe(true);
    });
});
