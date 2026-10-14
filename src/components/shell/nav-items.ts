import { ClipboardListIcon, LayoutDashboardIcon, LibraryBigIcon, type LucideIcon } from "lucide-react";

export type NavCourse = { id: string; name: string; color: string };
export type NavProps = { email: string; courses: NavCourse[] };

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/panel", label: "Özet", icon: LayoutDashboardIcon },
  { href: "/dersler", label: "Dersler", icon: LibraryBigIcon },
  { href: "/odevler", label: "Ödevler", icon: ClipboardListIcon },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/panel" && pathname.startsWith(href + "/"));
}
