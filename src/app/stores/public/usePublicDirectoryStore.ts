import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";

export type PublicDirectoryEntry = {
  FirstName: string | null;
  LastName: string | null;
  GithubLogin: string;
};
export type PublicDirectory = {
  Members: PublicDirectoryEntry[];
  Mentors: PublicDirectoryEntry[];
};

const PUBLIC_DIRECTORY_QUERY_KEY: readonly string[] = ["public", "githubDirectory"];
const GITHUB_LOGIN: RegExp = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

// Validate names and GitHub logins before constructing public links.
function isDirectoryEntry(value: unknown): value is PublicDirectoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry: Partial<PublicDirectoryEntry> = value;
  return typeof entry.GithubLogin === "string" && GITHUB_LOGIN.test(entry.GithubLogin)
    && (entry.FirstName === null || typeof entry.FirstName === "string")
    && (entry.LastName === null || typeof entry.LastName === "string");
}

// Validate the existing raw directory response and exclude malformed entries.
export function parsePublicDirectory(value: unknown): PublicDirectory {
  if (!value || typeof value !== "object") throw new Error("Invalid public directory response");
  const payload: Partial<PublicDirectory> = value;
  if (!Array.isArray(payload.Members) || !Array.isArray(payload.Mentors)) {
    throw new Error("Invalid public directory response");
  }
  // Copy only the published fields into the client cache.
  const publicEntry: (entry: PublicDirectoryEntry) => PublicDirectoryEntry = (entry: PublicDirectoryEntry): PublicDirectoryEntry => ({
    FirstName: entry.FirstName, LastName: entry.LastName, GithubLogin: entry.GithubLogin,
  });
  return { Members: payload.Members.filter(isDirectoryEntry).map(publicEntry), Mentors: payload.Mentors.filter(isDirectoryEntry).map(publicEntry) };
}

// Share anonymous directory data through the application's TanStack Query provider.
export function usePublicDirectoryStore(): UseQueryReturnType<PublicDirectory, Error> {
  return useQuery<PublicDirectory, Error>({
    queryKey: PUBLIC_DIRECTORY_QUERY_KEY,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<PublicDirectory> => {
      const payload: unknown = await $fetch<unknown>("/api/githubaccounts", { signal, retry: 0 });
      return parsePublicDirectory(payload);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
