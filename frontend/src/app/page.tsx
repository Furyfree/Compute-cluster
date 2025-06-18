// src/app/page.tsx
"use client";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <Image
        src="/images/Corp_red_RGB.png" // Replace with your DTU logo file name if you have one
        alt="DTU Logo"
        width={200}
        height={200}
      />
      <h1>Virtualization cluster</h1>
      <p> By Patrick, Frank & Emil</p>
      <button
        onClick={() => (window.location.href = "/auth/login")}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: "pointer",
          border: "none",
          borderRadius: "4px",
          backgroundColor: "#0070f3",
          color: "white",
        }}
      >
        Sign in
      </button>
    </main>
  );
}
