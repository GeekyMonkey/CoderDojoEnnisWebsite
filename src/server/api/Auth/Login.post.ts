// import {
// 	AuthError,
// 	createClient,
// 	Session,
// 	User,
// 	WeakPassword,
// } from "@supabase/supabase-js";
// import { defineEventHandler, readBody, useRuntimeConfig } from "#imports";
// import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
// import { members } from "~~/server/db/schema/schemas";
// import { and, eq, ilike, or } from "drizzle-orm";
// import { MemberEntity, ToMemberModel } from "~~/server/db/entities";
// import { MemberModel } from "~~/shared/types";
// import {
// 	GeneratePasswordHash,
// 	LoginToSupabase,
// } from "~~/server/utils/authUtils";

// // Define interfaces for the request body and query parameters
// type RequestBody = {
// 	username: string;
// 	password: string;
// };

// type ResponseBody = {
// 	member: MemberModel | null;
// 	session: Session | null;
// };

// /**
//  * POST: /api/Auth/Login
//  */
// export default defineEventHandler(
// 	async (event): Promise<ApiResponse<ResponseBody>> => {
// 		const logs: string[] = [];

// 		try {
// 			const { username, password } = await readBody<RequestBody>(event);
// 			logs.push("Login: " + JSON.stringify({ username }));

// 			let memberEntity: MemberEntity | null = null;
// 			let member: MemberModel | null = null;
// 			try {
// 				memberEntity = await findMember({
// 					username,
// 					password,
// 					logs,
// 					event,
// 				});
// 				logs.push(
// 					"Member found with matching password: " +
// 						JSON.stringify({ login: memberEntity?.login }),
// 				);
// 				if (memberEntity) {
// 					member = ToMemberModel(memberEntity);
// 				}
// 			} catch (error: any) {
// 				logs.push("Error finding member:", error.message);
// 			}

// 			let user = null;
// 			if (memberEntity != null) {
// 				try {
// 					user = await LoginToSupabase(memberEntity, logs);
// 				} catch (error: any) {
// 					logs.push("Error logging in to Supabase:", error.message);
// 				}
// 			}

// 			if (memberEntity && user) {
// 				return {
// 					success: true,
// 					data: {
// 						member,
// 						session: user?.session ?? null,
// 					},
// 					logs,
// 				};
// 			} else {
// 				return {
// 					success: false,
// 					error: "Invalid login",
// 					logs,
// 				};
// 			}
// 		} catch (error: any) {
// 			return {
// 				success: false,
// 				error: "[Login] POST error: " + error.message,
// 				logs: [error.message],
// 			};
// 		}
// 	},
// );

// /**
//  * Find a member with a matching username and password
//  */
// async function findMember({
// 	username,
// 	password,
// 	logs,
// 	event,
// }: {
// 	username: string;
// 	password: string;
// 	logs: string[];
// 	event: H3Event<EventHandlerRequest>;
// }): Promise<MemberEntity | null> {
// 	const db: DrizzleType = UseDrizzle(event);

// 	password = password.trim();
// 	const salt = useRuntimeConfig().private.auth.pass_salt;
// 	const passwordHash: string | null = await GeneratePasswordHash(
// 		password,
// 		salt,
// 	);
// 	logs.push("Hash: " + passwordHash);

// 	const usernameLower = username.trim().toLowerCase();
// 	const [usernameFirst, usernameLast] = usernameLower.split(" ");
// 	logs.push("Find Member: " + usernameLower);

// 	const memberLoginQuery = db
// 		.select()
// 		.from(members)
// 		.where(
// 			and(
// 				eq(members.deleted, false),
// 				//todo				eq(members.passwordHash, passwordHash ?? "_"),
// 				or(
// 					ilike(members.login, usernameLower),
// 					ilike(members.email, usernameLower),
// 					and(
// 						ilike(members.nameFirst, usernameFirst ?? ""),
// 						ilike(members.nameLast, usernameLast ?? ""),
// 					),
// 				),
// 			),
// 		);

// 	const loginMatches = await memberLoginQuery.execute();

// 	if (loginMatches.length === 0) {
// 		logs.push("member not found");
// 		return null;
// 	}

// 	// Check password hash
// 	logs.push("Login matches: " + loginMatches.length);
// 	const loginMatchesChecked = loginMatches.filter(
// 		(member) => member.passwordHash === passwordHash,
// 	);

// 	if (loginMatchesChecked.length == 0) {
// 		logs.push(
// 			`Error: member found, but password doesn't match: ${JSON.stringify({
// 				username: loginMatches[0].login,
// 				hash: loginMatches[0].passwordHash,
// 			})}`,
// 		);
// 	}

// 	return loginMatchesChecked?.[0] ?? null;
// }
