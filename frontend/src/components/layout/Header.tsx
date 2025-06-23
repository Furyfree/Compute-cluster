import { useState, useEffect } from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";
import { User } from "@/types/user";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-10 bg-dtu-white ${
        isScrolled ? "shadow-md" : "shadow-sm"
      } transition-shadow duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/dashboard"
                className="text-dtu-red font-bold text-xl"
              >
                Compute Cluster
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="border-transparent text-gray-700 hover:border-dtu-red hover:text-dtu-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/vms"
                className="border-transparent text-gray-700 hover:border-dtu-red hover:text-dtu-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Mine VM'er
              </Link>
              <Link
                href="/dashboard/remote"
                className="border-transparent text-gray-700 hover:border-dtu-red hover:text-dtu-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Remote Access
              </Link>
              {user?.is_admin && (
                <Link
                  href="/dashboard/proxmox"
                  className="border-transparent text-gray-700 hover:border-dtu-red hover:text-dtu-red inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Proxmox
                </Link>
              )}
            </nav>
          </div>
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
