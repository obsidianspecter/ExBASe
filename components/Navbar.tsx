"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Database, Plus, Menu, Settings } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigateToAdd = () => {
    router.push("/convict/add")
    setIsMenuOpen(false)
  }

  const navigateToHome = () => {
    router.push("/")
    setIsMenuOpen(false)
  }

  const navigateToSettings = () => {
    router.push("/settings")
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <span className="font-bold text-lg">ExBASe</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button variant={pathname === "/" ? "default" : "ghost"} onClick={navigateToHome}>
              Records
            </Button>
            <Button variant={pathname === "/convict/add" ? "default" : "secondary"} onClick={navigateToAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
            <Button variant={pathname === "/settings" ? "default" : "ghost"} onClick={navigateToSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                className="justify-start w-full"
                onClick={navigateToHome}
              >
                Records
              </Button>
              <Button
                variant={pathname === "/convict/add" ? "default" : "secondary"}
                className="justify-start w-full"
                onClick={navigateToAdd}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
              <Button
                variant={pathname === "/settings" ? "default" : "ghost"}
                className="justify-start w-full"
                onClick={navigateToSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

