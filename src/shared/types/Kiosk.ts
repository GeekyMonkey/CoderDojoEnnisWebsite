import type { AttendanceSignInResponseModel } from "./AttendanceModels";
import type { BeltModel } from "./models/BeltModel";

export type KioskStatus = { expiresAt: number };
export type KioskSignInResponse = AttendanceSignInResponseModel & { teamName: string | null; belt: BeltModel | null };
export type KioskSignInRequest = { kind: "password"; username: string; password: string } | { kind: "guid"; memberGuid: string } | { kind: "nfc"; nfcTag: string };
