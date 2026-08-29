"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Key, LayoutTemplate, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2 inline" /> },
  { href: "/admin/scenarios", label: "Skenario", icon: <FileText className="w-4 h-4 mr-2 inline" /> },
  { href: "/admin/keywords", label: "Keywords", icon: <Key className="w-4 h-4 mr-2 inline" /> },
  { href: "/admin/templates", label: "Templates", icon: <LayoutTemplate className="w-4 h-4 mr-2 inline" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" /> Pola Bicaramu <span className="text-xs text-gray-400 font-normal ml-2">Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center",
                    pathname === item.href
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center",
              pathname === item.href
                ? "bg-emerald-50 text-emerald-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
