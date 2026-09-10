import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tests/create", label: "Create New Test" },
  { href: "/tests", label: "View Existing Tests" },
];

export function NavBar() {
  return (
    <header className="bg-surface text-foreground">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold">Practice Tests</span>
        <nav className="flex gap-2 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2 py-1 hover:bg-surface-hover hover:text-foreground-invert"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
