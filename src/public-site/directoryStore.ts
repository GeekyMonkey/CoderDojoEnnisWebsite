export type DirectoryEntry = {
	FirstName: string | null;
	LastName: string | null;
	GithubLogin: string;
};
export type DirectoryData = {
	Members: DirectoryEntry[];
	Mentors: DirectoryEntry[];
};
export type DirectoryState = {
	data: DirectoryData | null;
	loading: boolean;
	error: string | null;
};
type DirectoryStore = {
	state: DirectoryState;
	load: () => Promise<void>;
};

const GITHUB_LOGIN: RegExp = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

/** Check public directory records before using them in links. */
function isEntry(value: unknown): value is DirectoryEntry {
	if (!value || typeof value !== "object") return false;
	const entry: Partial<DirectoryEntry> = value;
	return (
		typeof entry.GithubLogin === "string" &&
		GITHUB_LOGIN.test(entry.GithubLogin) &&
		(entry.FirstName === null || typeof entry.FirstName === "string") &&
		(entry.LastName === null || typeof entry.LastName === "string")
	);
}

/** Fetch and cache the existing public directory without exposing other account data. */
export function createDirectoryStore(): DirectoryStore {
	const state: DirectoryState = { data: null, loading: false, error: null };
	const load: () => Promise<void> = async (): Promise<void> => {
		if (state.loading || state.data) return;
		state.loading = true;
		state.error = null;
		try {
			const response: Response = await fetch("/api/githubaccounts", {
				signal: AbortSignal.timeout(15000),
			});
			if (!response.ok) throw new Error("Directory request failed");
			const payload: unknown = await response.json();
			if (!payload || typeof payload !== "object")
				throw new Error("Invalid directory");
			const data: Partial<DirectoryData> = payload;
			if (!Array.isArray(data.Members) || !Array.isArray(data.Mentors))
				throw new Error("Invalid directory");
			state.data = {
				Members: data.Members.filter(isEntry),
				Mentors: data.Mentors.filter(isEntry),
			};
		} catch {
			state.error =
				"Projects couldn’t be loaded. Please try again in a moment.";
		} finally {
			state.loading = false;
		}
	};
	return { state, load };
}
