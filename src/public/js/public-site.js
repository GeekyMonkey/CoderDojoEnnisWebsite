"use strict";
(() => {
  // src/public-site/directoryStore.ts
  var GITHUB_LOGIN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
  function isEntry(value) {
    if (!value || typeof value !== "object") return false;
    const entry = value;
    return typeof entry.GithubLogin === "string" && GITHUB_LOGIN.test(entry.GithubLogin) && (entry.FirstName === null || typeof entry.FirstName === "string") && (entry.LastName === null || typeof entry.LastName === "string");
  }
  function createDirectoryStore() {
    const state = { data: null, loading: false, error: null };
    const load = async () => {
      if (state.loading || state.data) return;
      state.loading = true;
      state.error = null;
      try {
        const response = await fetch("/api/githubaccounts", {
          signal: AbortSignal.timeout(15e3)
        });
        if (!response.ok) throw new Error("Directory request failed");
        const payload = await response.json();
        if (!payload || typeof payload !== "object")
          throw new Error("Invalid directory");
        const data = payload;
        if (!Array.isArray(data.Members) || !Array.isArray(data.Mentors))
          throw new Error("Invalid directory");
        state.data = {
          Members: data.Members.filter(isEntry),
          Mentors: data.Mentors.filter(isEntry)
        };
      } catch {
        state.error = "Projects couldn\u2019t be loaded. Please try again in a moment.";
      } finally {
        state.loading = false;
      }
    };
    return { state, load };
  }

  // src/public-site/public-site.ts
  var LEGACY_PAGES = {
    AboutModal: "/_about.html",
    ContactModal: "/_contact.html",
    JoinModal: "/_join.html",
    MembersModal: "/_members.html",
    NewsModal: "/_news.html",
    PrivacyModal: "/_privacy.html",
    TopicsModal: "/_topics.html",
    WhenWhereModal: "/_whenwhere.html"
  };
  function redirectLegacyHash() {
    if (window.location.pathname !== "/home.html") return;
    const hash = window.location.hash.replace(/^#\/?/, "");
    const page = LEGACY_PAGES[hash];
    if (page && Object.hasOwn(LEGACY_PAGES, hash)) window.location.replace(page);
  }
  function renderEntries(list, entries, emptyText) {
    list.replaceChildren();
    if (!entries.length) {
      const item = document.createElement("li");
      item.textContent = emptyText;
      list.append(item);
      return;
    }
    for (const entry of entries) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const avatar = document.createElement("img");
      const name = document.createElement("span");
      const displayName = [entry.FirstName, entry.LastName].filter(Boolean).join(" ") || entry.GithubLogin;
      link.href = `https://${entry.GithubLogin}.github.io`;
      link.className = "project-link";
      avatar.src = `https://avatars.githubusercontent.com/${encodeURIComponent(entry.GithubLogin)}`;
      avatar.alt = "";
      avatar.loading = "lazy";
      avatar.className = "project-avatar";
      avatar.addEventListener("error", () => {
        avatar.hidden = true;
      });
      name.textContent = `${displayName} \u2197`;
      link.append(avatar, name);
      item.append(link);
      list.append(item);
    }
  }
  function setupDirectory() {
    const status = document.getElementById("directory-status");
    const members = document.querySelector("#directory-members");
    const mentors = document.querySelector("#directory-mentors");
    const retry = document.querySelector("#directory-retry");
    if (!status || !members || !mentors || !retry) return;
    const store = createDirectoryStore();
    const refresh = async () => {
      retry.disabled = true;
      status.textContent = "Loading projects\u2026";
      await store.load();
      retry.disabled = false;
      retry.hidden = !store.state.error;
      if (store.state.error) {
        status.textContent = store.state.error;
        return;
      }
      if (!store.state.data) return;
      const data = store.state.data;
      renderEntries(
        members,
        data.Members,
        "No coder project pages are shared yet."
      );
      renderEntries(
        mentors,
        data.Mentors,
        "No mentor project pages are shared yet."
      );
      const count = data.Members.length + data.Mentors.length;
      status.textContent = count ? `${count} project ${count === 1 ? "page" : "pages"} to explore.` : "No project pages are shared yet. Check back for new ideas.";
    };
    retry.addEventListener("click", () => {
      void refresh();
    });
    void refresh();
  }
  redirectLegacyHash();
  window.addEventListener("hashchange", redirectLegacyHash);
  setupDirectory();
})();
