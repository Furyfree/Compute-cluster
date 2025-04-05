// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const expiresAt = localStorage.getItem('expires_at');
        if (expiresAt) {
        const msUntilExpiry = new Date(expiresAt).getTime() - new Date().getTime();
        setTimeout(() => {
        alert("Session expired. Please log in again.");
        handleLogout();
    }, msUntilExpiry);
}

        fetch('http://127.0.0.1:8000/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized');
                return res.json();
            })
            .then(setUser)
            .catch(() => {
                localStorage.removeItem('token');
                router.push('/login');
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('expires_at');
        router.push('/login');
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>👋 Welcome, {user.name}!</h1>
            <p>Email: {user.email}</p>
            <p>Admin: {user.is_admin ? '✅ Yes' : '❌ No'}</p>
            <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
                Logout
            </button>
        </div>
    );
}
