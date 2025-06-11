"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, LogIn, LogOut, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const publicNavItems = [
    { href: "/login", label: "Connexion", icon: LogIn }
  ];

  const authenticatedNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profil", icon: User }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl">🦏</div>
          <span className="text-xl font-bold text-gray-900">LeRhino</span>
        </Link>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">Chargement...</span>
            </div>
          ) : (
            <>
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
              
              {user && (
                <>
                  <div className="border-l border-gray-200 pl-4 ml-2">
                    <span className="text-sm text-gray-600">
                      Bonjour, <span className="font-medium">{user.username}</span>
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 