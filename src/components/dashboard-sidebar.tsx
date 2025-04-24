"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingBag, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isOwner = user && (user.role === "OWNER" || user.role === "ADMIN")

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      href: "/dashboard/rentals",
      label: "My Rentals",
      icon: <ShoppingBag className="h-4 w-4 mr-2" />,
    },
    ...(isOwner
      ? [
          {
            href: "/dashboard/products",
            label: "My Products",
            icon: <Package className="h-4 w-4 mr-2" />,
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <h2 className="text-xl font-semibold mb-2">My Account</h2>
        <p className="text-sm text-muted-foreground">Manage your rentals and products</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm rounded-md ${
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => logout()}
          className="flex items-center px-3 py-2 text-sm rounded-md w-full text-left hover:bg-muted"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </nav>
    </div>
  )
}
