import sql, { config } from "mssql";
import { LegacyBadgeCategoryEntity } from "./Models/LegacyBadgeCategoryEntity";
import { LegacyBadgeEntity } from "./Models/LegacyBadgeEntity";
import { LegacyTeamEntity } from "./Models/LegacyTeamEntity";
import { LegacyBeltEntity } from "./Models/LegacyBeltEntity";
import { LegacyMemberEntity } from "./Models/LegacyMemberEntity";
import { LegacyAdultEntity } from "./Models/LegacyAdultEntity";
import { LegacySessionEntity } from "./Models/LegacySessionEntity";
import { LegacyMemberAttendanceEntity } from "./Models/LegacyMemberAttendanceEntity";
import { LegacyAdultAttendanceEntity } from "./Models/LegacyAdultAttendanceEntity";
import { LegacyAdultBadgeCategoryEntity } from "./Models/LegacyAdultBadgeCategoryEntity";
import { LegacyMemberParentEntity } from "./Models/LegacyMemberParentEntity";
import { LegacyMemberBadgeEntity } from "./Models/LegacyMemberBadgeEntity";
import { LegacyMemberBeltEntity } from "./Models/LegacyMemberBeltEntity";

const config = useRuntimeConfig();

const sqlConfig: config = {
	user: config.private.legacy_data.user,
	password: config.private.legacy_data.pass,
	port: 1433,
	server: "geekymonkeysql.database.windows.net",
	database: "CoderDojoSql",
	options: {
		encrypt: true,
	},
};

async function ReadTable<T>(tableName: string): Promise<T[]> {
	try {
		let pool = await sql.connect(sqlConfig);
		let result = await pool
			.request()
			.query<T>(`SELECT * FROM ${tableName}`);
		return result.recordset;
	} catch (err: any) {
		throw new Error("SQL error: ", err.message);
	}
}

export async function ReadAdults(): Promise<LegacyAdultEntity[]> {
	return await ReadTable<LegacyAdultEntity>("Adults");
}

export async function ReadAdultAttendances(): Promise<
	LegacyAdultAttendanceEntity[]
> {
	return await ReadTable<LegacyAdultAttendanceEntity>("AdultAttendance");
}

export async function ReadAdultBadgeCategories(): Promise<
	LegacyAdultBadgeCategoryEntity[]
> {
	return await ReadTable<LegacyAdultBadgeCategoryEntity>(
		"AdultBadgeCategory",
	);
}

export async function ReadBadgeCategories(): Promise<
	LegacyBadgeCategoryEntity[]
> {
	return await ReadTable<LegacyBadgeCategoryEntity>("BadgeCategories");
}

export async function ReadBadges(): Promise<LegacyBadgeEntity[]> {
	return await ReadTable<LegacyBadgeEntity>("Badges");
}

export async function ReadBelts(): Promise<LegacyBeltEntity[]> {
	return await ReadTable<LegacyBeltEntity>("Belts");
}

export async function ReadNinjas(): Promise<LegacyMemberEntity[]> {
	return await ReadTable<LegacyMemberEntity>("Members");
}

export async function ReadMemberAttendances(): Promise<
	LegacyMemberAttendanceEntity[]
> {
	return await ReadTable<LegacyMemberAttendanceEntity>("MemberAttendance");
}

export async function ReadMemberBadges(): Promise<LegacyMemberBadgeEntity[]> {
	return await ReadTable<LegacyMemberBadgeEntity>("MemberBadges");
}

export async function ReadMemberBelts(): Promise<LegacyMemberBeltEntity[]> {
	return await ReadTable<LegacyMemberBeltEntity>("MemberBelts");
}

export async function ReadMemberParents(): Promise<LegacyMemberParentEntity[]> {
	return await ReadTable<LegacyMemberParentEntity>("MemberParent");
}

export async function ReadSessions(): Promise<LegacySessionEntity[]> {
	return await ReadTable<LegacySessionEntity>("Sessions");
}

export async function ReadTeams(): Promise<LegacyTeamEntity[]> {
	return await ReadTable<LegacyTeamEntity>("Teams");
}
