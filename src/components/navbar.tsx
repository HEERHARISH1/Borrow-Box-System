"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { Menu, X, Package, User, LogOut, Plus, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [user])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Package className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">Borrow Box</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/products"
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
            >
              Browse Products
            </Link>
            {user && (
              <Link
                href="/my-rentals"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              >
                My Rentals
              </Link>
            )}
            {user && (
              <Link
                href="/my-products"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              >
                My Products
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-products">My Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-rentals">My Rentals</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </>
            )}
            {user && (
              <Button asChild>
                <Link href="/products/new">
                  <Plus className="mr-2 h-4 w-4" /> List Product
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden flex items-center" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                onClick={toggleMenu}
              >
                Browse Products
              </Link>
              {user && (
                <>
                  <Link
                    href="/my-rentals"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                    onClick={toggleMenu}
                  >
                    My Rentals
                  </Link>
                  <Link
                    href="/my-products"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                    onClick={toggleMenu}
                  >
                    My Products
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/products/new"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                    onClick={toggleMenu}
                  >
                    List Product
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                      onClick={toggleMenu}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      toggleMenu()
                    }}
                    className="bg-black text-gray-600 hover:text-primary text-left dark:text-gray-300 dark:hover:text-primary"
                  >
                    Log out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                    onClick={toggleMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
