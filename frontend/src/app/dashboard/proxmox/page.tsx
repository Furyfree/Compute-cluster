"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

export default function ProxmoxPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const res = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Authentication failed');
        }

        const userData = await res.json();
        setUser(userData);

        // Check if user is admin
        if (!userData.is_admin) {
          throw new Error('Adgang nægtet: Kun administratorer kan tilgå Proxmox');
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Authentication failed');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user?.is_admin) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-red-600">
            {error || 'Adgang nægtet: Kun administratorer kan tilgå Proxmox'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Du har ikke de nødvendige rettigheder til at tilgå denne side.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Tilbage til Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
        <h1 className="text-lg font-medium text-gray-900">
          Proxmox Administration
        </h1>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Tilbage til Dashboard
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            Her kan du administrere Proxmox VE infrastrukturen. Denne side giver dig direkte adgang til Proxmox administrationsgrænsefladen.
          </p>
        </div>
        <div className="h-[75vh] w-full">
          <iframe
            src="https://localhost:8006/"
            className="w-full h-full border-none"
            title="Proxmox VE Administration"
          />
        </div>
      </div>
    </div>
  );
}
