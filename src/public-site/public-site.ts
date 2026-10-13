import { createDirectoryStore, type DirectoryEntry } from "./directoryStore";

const LEGACY_PAGES: Readonly<Record<string, string>> = {
	AboutModal: "/_about.html",
	ContactModal: "/_contact.html",
	JoinModal: "/_join.html",
	MembersModal: "/_members.html",
	NewsModal: "/_news.html",
	PrivacyModal: "/_privacy.html",
	TopicsModal: "/_topics.html",
	WhenWhereModal: "/_whenwhere.html",
};

/** Send old modal bookmarks to their standalone pages. */
function redirectLegacyHash(): void {
	if (window.location.pathname !== "/home.html") return;
	const hash: string = window.location.hash.replace(/^#\/?/, "");
	const page: string | undefined = LEGACY_PAGES[hash];
	if (page && Object.hasOwn(LEGACY_PAGES, hash)) window.location.replace(page);
}

/** Render validated profile links with text nodes rather than HTML strings. */
function renderEntries(
	list: HTMLUListElement,
	entries: DirectoryEntry[],
	emptyText: string,
): void {
	list.replaceChildren();
	if (!entries.length) {
		const item: HTMLLIElement = document.createElement("li");
		item.textContent = emptyText;
		list.append(item);
		return;
	}
	for (const entry of entries) {
		const item: HTMLLIElement = document.createElement("li");
		const link: HTMLAnchorElement = document.createElement("a");
		const avatar: HTMLImageElement = document.createElement("img");
		const name: HTMLSpanElement = document.createElement("span");
		const displayName: string =
			[entry.FirstName, entry.LastName].filter(Boolean).join(" ") ||
			entry.GithubLogin;
		link.href = `https://${entry.GithubLogin}.github.io`;
		link.className = "project-link";
		avatar.src = `https://avatars.githubusercontent.com/${encodeURIComponent(entry.GithubLogin)}`;
		avatar.alt = "";
		avatar.loading = "lazy";
		avatar.className = "project-avatar";
		// Keep unavailable profile images from showing a broken-image placeholder.
		avatar.addEventListener("error", (): void => {
			avatar.hidden = true;
		});
		name.textContent = `${displayName} ↗`;
		link.append(avatar, name);
		item.append(link);
		list.append(item);
	}
}

/** Connect directory state to the public project page and its retry action. */
function setupDirectory(): void {
	const status: HTMLElement | null =
		document.getElementById("directory-status");
	const members: HTMLUListElement | null =
		document.querySelector("#directory-members");
	const mentors: HTMLUListElement | null =
		document.querySelector("#directory-mentors");
	const retry: HTMLButtonElement | null =
		document.querySelector("#directory-retry");
	if (!status || !members || !mentors || !retry) return;
	const store: ReturnType<typeof createDirectoryStore> = createDirectoryStore();
	const refresh: () => Promise<void> = async (): Promise<void> => {
		retry.disabled = true;
		status.textContent = "Loading projects…";
		await store.load();
		retry.disabled = false;
		retry.hidden = !store.state.error;
		if (store.state.error) {
			status.textContent = store.state.error;
			return;
		}
		if (!store.state.data) return;
		const data: NonNullable<typeof store.state.data> = store.state.data;
		renderEntries(
			members,
			data.Members,
			"No coder project pages are shared yet.",
		);
		renderEntries(
			mentors,
			data.Mentors,
			"No mentor project pages are shared yet.",
		);
		const count: number = data.Members.length + data.Mentors.length;
		status.textContent = count
			? `${count} project ${count === 1 ? "page" : "pages"} to explore.`
			: "No project pages are shared yet. Check back for new ideas.";
	};
	retry.addEventListener("click", (): void => {
		void refresh();
	});
	void refresh();
}

redirectLegacyHash();
window.addEventListener("hashchange", redirectLegacyHash);
setupDirectory();
