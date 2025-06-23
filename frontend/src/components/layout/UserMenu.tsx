import { Fragment } from "react";
import { User } from "@/types/user";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expires_at");
    router.push("/auth/login");
  };

  return (
    <div className="relative ml-3">
      <div className="flex items-center">
        <div className="relative">
          <button
            type="button"
            className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dtu-red"
            id="user-menu-button"
            aria-expanded="false"
            aria-haspopup="true"
            onClick={() =>
              document
                .getElementById("user-dropdown")
                ?.classList.toggle("hidden")
            }
          >
            <span className="sr-only">Åbn brugermenu</span>
            <div className="h-8 w-8 rounded-full bg-dtu-red-50 flex items-center justify-center">
              <span className="font-medium text-dtu-red">
                {user.name.charAt(0)}
              </span>
            </div>
            <span className="hidden md:block ml-2 text-sm text-gray-700">
              {user.name}
            </span>
            <svg
              className="ml-1 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="user-dropdown"
        className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
        tabIndex={-1}
      >
        <Link
          href="/dashboard/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-dtu-red"
          role="menuitem"
        >
          Min Profil
        </Link>
        <Link
          href="/dashboard/settings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-dtu-red"
          role="menuitem"
        >
          Indstillinger
        </Link>
        {user.is_admin && (
          <Link
            href="/admin"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-dtu-red"
            role="menuitem"
          >
            Admin Panel
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-dtu-red"
          role="menuitem"
        >
          Log ud
        </button>
      </div>
    </div>
  );
}
