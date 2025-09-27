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

async function ReadLegacyTable<T>(tableName: string): Promise<T[]> {
	try {
		let pool = await sql.connect(sqlConfig);
		let result = await pool
			.request()
			.query<T>(`SELECT * FROM ${tableName}`);

		// Convert passwordHash field to byte array if it exists
		result.recordset.forEach((record: any) => {
			if (record.PasswordHash) {
				// Manually convert legacy data reading here
			}
		});

		return result.recordset;
	} catch (err: any) {
		throw new Error("SQL error: ", err.message);
	}
}

export async function ReadLegacyAdults(): Promise<LegacyAdultEntity[]> {
	return await ReadLegacyTable<LegacyAdultEntity>("Adults");
}

export async function ReadLegacyAdultAttendances(): Promise<
	LegacyAdultAttendanceEntity[]
> {
	return await ReadLegacyTable<LegacyAdultAttendanceEntity>("AdultAttendance");
}

export async function ReadLegacyAdultBadgeCategories(): Promise<
	LegacyAdultBadgeCategoryEntity[]
> {
	return await ReadLegacyTable<LegacyAdultBadgeCategoryEntity>(
		"AdultBadgeCategory",
	);
}

export async function ReadLegacyBadgeCategories(): Promise<
	LegacyBadgeCategoryEntity[]
> {
	return await ReadLegacyTable<LegacyBadgeCategoryEntity>("BadgeCategories");
}

export async function ReadLegacyBadges(): Promise<LegacyBadgeEntity[]> {
	return await ReadLegacyTable<LegacyBadgeEntity>("Badges");
}

export async function ReadLegacyBelts(): Promise<LegacyBeltEntity[]> {
	return await ReadLegacyTable<LegacyBeltEntity>("Belts");
}

export async function ReadLegacyNinjas(): Promise<LegacyMemberEntity[]> {
	return await ReadLegacyTable<LegacyMemberEntity>("Members");
}

export async function ReadLegacyMemberAttendances(): Promise<
	LegacyMemberAttendanceEntity[]
> {
	return await ReadLegacyTable<LegacyMemberAttendanceEntity>("MemberAttendance");
}

export async function ReadLegacyMemberBadges(): Promise<LegacyMemberBadgeEntity[]> {
	return await ReadLegacyTable<LegacyMemberBadgeEntity>("MemberBadges");
}

export async function ReadLegacyMemberBelts(): Promise<LegacyMemberBeltEntity[]> {
	return await ReadLegacyTable<LegacyMemberBeltEntity>("MemberBelts");
}

export async function ReadLegacyMemberParents(): Promise<LegacyMemberParentEntity[]> {
	return await ReadLegacyTable<LegacyMemberParentEntity>("MemberParent");
}

export async function ReadLegacySessions(): Promise<LegacySessionEntity[]> {
	return await ReadLegacyTable<LegacySessionEntity>("Sessions");
}

export async function ReadLegacyTeams(): Promise<LegacyTeamEntity[]> {
	return await ReadLegacyTable<LegacyTeamEntity>("Teams");
}
