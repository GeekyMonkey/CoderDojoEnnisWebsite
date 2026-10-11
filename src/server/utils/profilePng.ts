import { Buffer } from "node:buffer";
import { inflateSync } from "node:zlib";
import { createError } from "h3";
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS } from "#shared/types/ProfileImages";

const CRC_TABLE: Uint32Array = Uint32Array.from({ length: 256 }, (_value: unknown, index: number): number => {
    let crc: number = index;
    for (let bit: number = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    return crc >>> 0;
});

/** Check chunk integrity before decompressing bounded PNG data. */
function crc32(bytes: Buffer): number {
    let crc: number = 0xffffffff;
    for (let index: number = 0; index < bytes.length; index++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[index]!) & 0xff]!;
    return (crc ^ 0xffffffff) >>> 0;
}

/** Reject oversized or invalid PNG dimensions before touching storage. */
export function validateProfilePng(encoded: string): Buffer {
    const bytes: Buffer = Buffer.from(encoded, "base64");
    const signature: Buffer = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (bytes.length < 45 || bytes.length > MAX_IMAGE_BYTES || !bytes.subarray(0, 8).equals(signature) || bytes.readUInt32BE(8) !== 13 || bytes.toString("ascii", 12, 16) !== "IHDR") throw createError({ statusCode: 400, statusMessage: "A processed PNG image is required" });
    const width: number = bytes.readUInt32BE(16);
    const height: number = bytes.readUInt32BE(20);
    if (!width || width !== height || width > MAX_IMAGE_PIXELS) throw createError({ statusCode: 400, statusMessage: "Images must be square and at most 800 pixels" });
    let offset: number = 8;
    const compressed: Buffer[] = [];
    while (offset + 12 <= bytes.length) {
        const length: number = bytes.readUInt32BE(offset);
        const kind: string = bytes.toString("ascii", offset + 4, offset + 8);
        if (length > bytes.length - offset - 12) break;
        if (crc32(bytes.subarray(offset + 4, offset + 8 + length)) !== bytes.readUInt32BE(offset + 8 + length)) break;
        if (kind === "IDAT") compressed.push(bytes.subarray(offset + 8, offset + 8 + length));
        offset += length + 12;
        if (kind === "IEND" && length === 0 && compressed.length && offset === bytes.length) {
            const channels: number = bytes[25] === 6 ? 4 : bytes[25] === 2 ? 3 : 0;
            if (bytes[24] !== 8 || !channels || bytes[26] !== 0 || bytes[27] !== 0 || bytes[28] !== 0) break;
            const stride: number = width * channels + 1;
            try {
                const raster: Buffer = inflateSync(Buffer.concat(compressed), { maxOutputLength: stride * height });
                if (raster.length !== stride * height) break;
                for (let row: number = 0; row < height; row++) if (raster[row * stride]! > 4) throw new Error("Invalid PNG filter");
                return bytes;
            } catch { break; }
        }
    }
    throw createError({ statusCode: 400, statusMessage: "Invalid PNG image" });
}

