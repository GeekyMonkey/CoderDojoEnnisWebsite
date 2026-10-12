import { createError, defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { GetSupabaseAdminClient, type SupabaseClientType } from "#server/db/DatabaseClient";

export type GithubDirectoryEntry = {
 FirstName: string | null;
 LastName: string | null;
 GithubLogin: string;
};
export type GithubDirectory = { Members: GithubDirectoryEntry[]; Mentors: GithubDirectoryEntry[] };
type GithubDirectoryRecord = {
 name_first: string | null;
 name_last: string | null;
 github_login: string | null;
 is_ninja: boolean;
 is_mentor: boolean;
};

/** Serve the public directory from current accounts using the static page's contract. */
export default defineEventHandler(async (event: H3Event): Promise<GithubDirectory> => {
 const supabase: SupabaseClientType | null = await GetSupabaseAdminClient(event);
 if (!supabase) throw createError({ statusCode: 503, statusMessage: "GitHub directory unavailable" });
 const { data, error } = await supabase.schema("coderdojo").from("members")
  .select("name_first,name_last,github_login,is_ninja,is_mentor")
  .eq("deleted", false)
  .or("is_ninja.eq.true,is_mentor.eq.true")
  .not("github_login", "is", null)
  .neq("github_login", "")
  .order("name_first", { ascending: true })
  .order("name_last", { ascending: true })
  .order("id", { ascending: true });
 if (error || !data) throw createError({ statusCode: 503, statusMessage: "GitHub directory unavailable" });
 const records: GithubDirectoryRecord[] = data;
 const directory: GithubDirectory = { Members: [], Mentors: [] };
 for (const record of records) {
  if (!record.github_login?.trim()) continue;
  const entry: GithubDirectoryEntry = { FirstName: record.name_first, LastName: record.name_last, GithubLogin: record.github_login };
  if (record.is_ninja) directory.Members.push(entry);
  if (record.is_mentor) directory.Mentors.push(entry);
 }
 setResponseHeader(event, "Cache-Control", "public, max-age=300");
 return directory;
});
