"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, LogIn } from "lucide-react";
import { clsx } from "clsx";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/login", label: "Connexion", icon: LogIn },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl">🦏</div>
          <span className="text-xl font-bold text-gray-900">LeRhino</span>
        </Link>

        <div className="flex items-center space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 