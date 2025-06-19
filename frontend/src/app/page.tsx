'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // bruges til navigation efter login

export default function Home() {
  const router = useRouter();

  // State til at holde brugernavn og kodeord
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Funktion der kaldes ved login
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault(); // forhindrer siden i at reloade

    // Du kan her lave validering eller API-kald
    if (username === 'admin' && password === 'admin') {
      // Hvis det er korrekt, send brugeren videre
      router.push('/dashboard');
    } else {
      alert('Forkert brugernavn eller kodeord');
    }
  };


  return (
    // Hele skærmen, centreret både vandret og lodret, med lysegrå baggrund
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Login-boksen i midten: hvid baggrund, padding, afrundede hjørner, skygge, fast bredde */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        
        {/* Titel-afsnit */}
        <div className="mb-6 text-center">
          {/* Overskrift: stor tekst, fed, mørkegrå farve */}
          <h1 className="text-2xl font-bold text-gray-700">Login</h1>
        </div>

        {/* Formular med spacing mellem elementer */}
        <form className="space-y-4">
          
          {/* Username-felt */}
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-800" // Laver label til blok, lille tekst, medium fed, grå
            >
              Username {/*user tekstfelt*/}
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"  
              className="mt-1 w-full border rounded-md p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              // margin-top: 0.25rem, full width, border, afrundede hjørner, padding 0.5rem, tekst er grå
              // på focus: ingen outline, blå ring omkring
            />
          </div>

          {/* Password-felt */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password {/*password tekstfelt*/}
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              className="mt-1 w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sign In-knap */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"

            // full width, baggrundsfarve, hvid tekst, padding Y: 0.5rem, afrundet
            // når man holder musen over: mørkere blå
          >
            Sign in
          </button>

          {/* Sign up-knap */}
          <button
            type="button"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
             onClick={() => alert('Sign up clicked')}
            // full width, blå baggrund, hvid tekst, padding Y: 0.5rem, afrundet
            // når man holder musen over: mørkere blå
          >
            Sign up
          </button>
        </form>
      </div>
    </main>
  );
}