import { z } from "zod";

export type ProfileImageSlot = "photo" | "avatar";
export const MAX_IMAGE_PIXELS: number = 800;
export const MAX_IMAGE_BYTES: number = 3_000_000;
export const MAX_SOURCE_BYTES: number = 20_000_000;
export type ProfileImageAction = { action: "upload"; slot: ProfileImageSlot; png: string } | { action: "delete"; slot: ProfileImageSlot } | { action: "copyAvatarToPhoto" };
export const profileImageActionSchema: z.ZodType<ProfileImageAction> = z.discriminatedUnion("action", [
    z.strictObject({ action: z.literal("upload"), slot: z.enum(["photo", "avatar"]), png: z.string().max(4_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/) }),
    z.strictObject({ action: z.literal("delete"), slot: z.enum(["photo", "avatar"]) }),
    z.strictObject({ action: z.literal("copyAvatarToPhoto") }),
]);
export type ImagePoint = { x: number; y: number };
export type ImageTransform = { zoom: number; panX: number; panY: number };
export type ImageGeometry = { outputSize: number; x: number; y: number; width: number; height: number };
export const MIN_IMAGE_ZOOM: number = 0.25;
export const MAX_IMAGE_ZOOM: number = 8;

/** Fit the initial image and apply pan and zoom relative to the crop frame. */
export function imageGeometry(width: number, height: number, transform: ImageTransform, round: boolean): ImageGeometry {
    const outputSize: number = Math.min(MAX_IMAGE_PIXELS, Math.max(width, height));
    const scale: number = outputSize * transform.zoom / (round ? Math.hypot(width, height) : Math.max(width, height));
    const targetWidth: number = width * scale;
    const targetHeight: number = height * scale;
    return { outputSize, x: (outputSize - targetWidth) / 2 + transform.panX * outputSize, y: (outputSize - targetHeight) / 2 + transform.panY * outputSize, width: targetWidth, height: targetHeight };
}

/** Bound zoom and keep part of the image in the frame while allowing transparent padding. */
export function clampImageTransform(width: number, height: number, transform: ImageTransform, round: boolean): ImageTransform {
    const zoom: number = Math.min(MAX_IMAGE_ZOOM, Math.max(MIN_IMAGE_ZOOM, transform.zoom));
    const geometry: ImageGeometry = imageGeometry(width, height, { ...transform, zoom }, round);
    const relativeWidth: number = geometry.width / geometry.outputSize;
    const relativeHeight: number = geometry.height / geometry.outputSize;
    const limitX: number = 0.5 + relativeWidth / 2 - Math.min(0.05, relativeWidth);
    const limitY: number = 0.5 + relativeHeight / 2 - Math.min(0.05, relativeHeight);
    return { zoom, panX: Math.min(limitX, Math.max(-limitX, transform.panX)), panY: Math.min(limitY, Math.max(-limitY, transform.panY)) };
}

/** Preserve the source point under a cursor or pinch midpoint as it moves and zooms. */
export function zoomImageTransform(transform: ImageTransform, zoom: number, anchor: ImagePoint, destination: ImagePoint = anchor): ImageTransform {
    const boundedZoom: number = Math.min(MAX_IMAGE_ZOOM, Math.max(MIN_IMAGE_ZOOM, zoom));
    const ratio: number = boundedZoom / transform.zoom;
    return { zoom: boundedZoom, panX: destination.x - 0.5 + (0.5 + transform.panX - anchor.x) * ratio, panY: destination.y - 0.5 + (0.5 + transform.panY - anchor.y) * ratio };
}
