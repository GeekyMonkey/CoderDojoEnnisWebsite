import { Buffer } from "node:buffer";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { validateProfilePng } from "./profilePng";

/** Build real PNG chunks with their CRCs for validation cases. */
function chunk(kind: string, data: Buffer): Buffer {
    const bytes: Buffer = Buffer.concat([Buffer.from(kind), data]);
    let crc: number = 0xffffffff;
    for (const byte of bytes) { crc ^= byte; for (let bit: number = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    const header: Buffer = Buffer.alloc(4); header.writeUInt32BE(data.length);
    const footer: Buffer = Buffer.alloc(4); footer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([header, bytes, footer]);
}

/** Generate a transparent RGBA square with valid compressed raster data. */
function png(width: number, height: number): Buffer {
    const header: Buffer = Buffer.alloc(13);
    header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
    return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.alloc((width * 4 + 1) * height))), chunk("IEND", Buffer.alloc(0))]);
}

describe("processed profile PNG validation", (): void => {
    it("accepts a transparent 800 pixel output", (): void => {
        const image: Buffer = png(800, 800);
        expect(validateProfilePng(image.toString("base64"))).toEqual(image);
    });
    it("rejects oversized, rectangular, truncated and corrupt images", (): void => {
        for (const image of [png(801,801), png(20,10), png(20,20).subarray(0,40), Buffer.from("not an image")]) expect((): Buffer => validateProfilePng(image.toString("base64"))).toThrow();
        const damaged: Buffer = png(20,20); damaged[damaged.length - 1] = damaged[damaged.length - 1]! ^ 1;
        expect((): Buffer => validateProfilePng(damaged.toString("base64"))).toThrow();
    });
});
