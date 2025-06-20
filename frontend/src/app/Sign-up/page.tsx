'use client';

import { useRouter } from 'next/navigation';

export default function CreateUser() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-[2rem] border border-black shadow-md w-full max-w-md">
        {/* Titel */}
        <h1 className="text-2xl font-bold text-center mb-6">Create User</h1>

        {/* Formular */}
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-black text-gray-700 rounded-md p-2"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-black text-gray-700 rounded-md p-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-black text-gray-700 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-black text-gray-700 rounded-md p-2"
          />

          {/* Knapper */}
          <div className="flex justify-between pt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded border border-black"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => router.back()} // Går tilbage til forrige side
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded border border-black"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
