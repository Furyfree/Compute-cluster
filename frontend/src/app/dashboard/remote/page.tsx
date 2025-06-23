"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface RemotePageProps {}

export default function RemotePage({}: RemotePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const vmId = searchParams.get('vm');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const res = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Authentication failed');
        }

        // Here you would typically make a call to initialize the Guacamole connection
        // if vmId is present, you'd connect directly to that VM

        setIsLoading(false);
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Authentication failed');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [vmId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-red-600">{error}</h2>
          <p className="mt-2 text-sm text-gray-500">
            Der opstod en fejl ved forbindelse til remote desktop.
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
          {vmId ? `Remote Desktop - VM ${vmId}` : 'Remote Desktop Access'}
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
            {vmId
              ? 'Du er ved at forbinde til den valgte virtuelle maskine. Kontroller at pop-up blokkering er deaktiveret.'
              : 'Vælg en virtuel maskine fra listen eller brug Guacamole interfacet nedenfor.'}
          </p>
        </div>
        <div className="h-[75vh] w-full">
          <iframe
            src="http://localhost:8001/guacamole/"
            className="w-full h-full border-none"
            title="Guacamole Remote Desktop"
          />
        </div>
      </div>
    </div>
  );
}
