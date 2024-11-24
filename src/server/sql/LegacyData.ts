import sql, { config } from "mssql";
import { LegacyBadgeCategoryEntity } from "./Models/LegacyBadgeCategoryEntity";
import { LegacyBadgeEntity } from "./Models/LegacyBadgeEntity";
import { LegacyTeamEntity } from "./Models/LegacyTeamEntity";
import { LegacyBeltEntity } from "./Models/LegacyBeltEntity";
import { LegacyMemberEntity } from "./Models/LegacyMemberEntity";
import { LegacyAdultEntity } from "./Models/LegacyAdultEntity";

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

async function ReatTable<T>(tableName: string): Promise<T[]> {
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
	return await ReatTable<LegacyAdultEntity>("Adults");
}

export async function ReadBadgeCategories(): Promise<
	LegacyBadgeCategoryEntity[]
> {
	return await ReatTable<LegacyBadgeCategoryEntity>("BadgeCategories");
}

export async function ReadBadges(): Promise<LegacyBadgeEntity[]> {
	return await ReatTable<LegacyBadgeEntity>("Badges");
}

export async function ReadBelts(): Promise<LegacyBeltEntity[]> {
	return await ReatTable<LegacyBeltEntity>("Belts");
}

export async function ReadNinjas(): Promise<LegacyMemberEntity[]> {
	return await ReatTable<LegacyMemberEntity>("Members");
}

export async function ReadTeams(): Promise<LegacyTeamEntity[]> {
	return await ReatTable<LegacyTeamEntity>("Teams");
}
