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
            <Container className={styles.centered}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container className={styles.centered}>
            <Typography variant="h4" gutterBottom>
                {isBanned ? 'You are currently banned.' : 'You are currently not banned.'}
            </Typography>
            <Typography variant="body1" gutterBottom style={{ color: 'red' }}>
                Note: This is a proof of concept. A third-party ban service (e.g. OASIS in Germany) will be used in the future. Currently, you can ban and unban yourself for demonstration purposes.
            </Typography>
            <Button
                variant="contained"
                style={{ backgroundColor: 'black', color: 'white' }}
                onClick={handleBanToggle}
            >
                {isBanned ? 'Unban Yourself' : 'Ban Yourself'}
            </Button>
            <button onClick={() => router.push('/')} className={styles.homeButton}>
                Go to Homepage
            </button>
        </Container>
    );

}

export default BanStatus;
