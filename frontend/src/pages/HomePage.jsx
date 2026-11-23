import React, { useEffect, useState } from 'react';
import { Link } from 'react';
import api from '../api';

export default function HomePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data from Django API when component mounts
        api.get('/api/home/')
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching home data:', error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>{data?.message}</h1>

            {data?.user ? (
                <div>
                    <p>Welcome back, <strong>{data.user.first_name || data.user.username}</strong>!</p>
                    <p>Role: {data.user.role}</p>
                </div>
            ) : (
                <div>
                    <p>Please log in or register to continue.</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <a href="/login">Login</a>
                        <a href="/register">Register</a>
                    </div>
                </div>
            )}
        </div>
    );
}