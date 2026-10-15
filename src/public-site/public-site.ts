const LEGACY_PAGES: Readonly<Record<string, string>> = {
	AboutModal: "/_about.html",
	ContactModal: "/_contact.html",
	JoinModal: "/_join.html",
	MembersModal: "/showcase",
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

redirectLegacyHash();
window.addEventListener("hashchange", redirectLegacyHash);
