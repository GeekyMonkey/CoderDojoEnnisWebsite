export type PublicNavigationLink = { label: string; to: string };
export const PUBLIC_PRIMARY_LINKS: readonly PublicNavigationLink[] = [
  { label: "Home", to: "/" }, { label: "About", to: "/about" },
  { label: "Visit", to: "/visit" }, { label: "Calendar", to: "/calendar" },
  { label: "Join", to: "/join" },
  { label: "Explore", to: "/explore" }, { label: "Showcase", to: "/showcase" },
  { label: "News", to: "/news" }, { label: "Contact", to: "/contact" },
];
export const PUBLIC_SECONDARY_LINKS: readonly PublicNavigationLink[] = [
  { label: "Privacy", to: "/privacy" }, { label: "Lab", to: "/lab" },
  { label: "Chat", to: "/chat" }, { label: "Gift ideas", to: "/gift-ideas" },
  { label: "Tidy Towns 2020", to: "/archive/tidy-towns-2020" },
];
