"use strict";
(() => {
  // public-site/public-site.ts
  var LEGACY_PAGES = {
    AboutModal: "/_about.html",
    ContactModal: "/_contact.html",
    JoinModal: "/_join.html",
    MembersModal: "/showcase",
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
  redirectLegacyHash();
  window.addEventListener("hashchange", redirectLegacyHash);
})();
