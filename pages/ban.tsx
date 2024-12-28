import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Container, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import styles from './ban.module.css';

const BanStatus = () => {
    const [isBanned, setIsBanned] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchBanStatus = async () => {
            try {
                const response = await axios.get('/api/ban/status');
                setIsBanned(response.data.banned);
            } catch (error) {
                console.error('Error fetching ban status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanStatus();
    }, []);

    const handleBanToggle = async () => {
        setLoading(true);
        try {
            const endpoint = isBanned ? '/api/ban/oasis-unban' : '/api/ban/oasis-ban';
            await axios.post(endpoint, { name: "testname" });
            setIsBanned(!isBanned);
        } catch (error) {
            console.error('Error toggling ban status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.gradientBackground}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className={styles.gradientBackground}>
            <Container className={styles.centered}>
                <Typography variant="h4" gutterBottom>
                    {isBanned ? 'You are currently banned.' : 'You are currently not banned.'}
                </Typography>
                <Typography variant="body1" gutterBottom style={{ color: 'white', maxWidth: '700px', margin: '0 auto' }}>
                    Note: This is a proof of concept. A third-party ban service (e.g. OASIS in Germany) will be used in the future. Currently, you can ban and unban yourself for demonstration purposes.
                </Typography>
                <button onClick={handleBanToggle} className={styles.banButton}>
                    {isBanned ? 'Unban Yourself' : 'Ban Yourself'}
                </button>
                <button onClick={() => router.push('/')} className={styles.homeButton}>
                    Go to Homepage
                </button>
            </Container>
        </div>
    );
}

export default BanStatus;
