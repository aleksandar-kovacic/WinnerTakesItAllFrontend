import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/router'; // Import useRouter
import styles from './verify.module.css';

const Verify = () => {
    const [idFrontImage, setIdFrontImage] = useState<File | null>(null);
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(null); // Initialize as null
    const [checkingStatus, setCheckingStatus] = useState(true); // Add checkingStatus state

    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        const checkVerificationStatus = async () => {
            try {
                const response = await axios.get('/api/verification/status');
                setIsVerified(response.data.verified);
            } catch (err) {
                console.error('Error checking verification status:', err);
                setIsVerified(false); // Set to false if there's an error
            } finally {
                setCheckingStatus(false); // Set checkingStatus to false after check
            }
        };

        checkVerificationStatus();
    }, []);

    const onDrop = useCallback((acceptedFiles: File[], setImage: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setImage(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps: getIdRootProps, getInputProps: getIdInputProps } = useDropzone({
        onDrop: (files) => onDrop(files, setIdFrontImage),
        accept: { 'image/*': [] },
    });

    const { getRootProps: getPersonRootProps, getInputProps: getPersonInputProps } = useDropzone({
        onDrop: (files) => onDrop(files, setPersonImage),
        accept: { 'image/*': [] },
    });

    const handleImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).replace(/^data:image\/[a-z]+;base64,/, '');
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert images to base64
        const idFrontImageBase64 = idFrontImage ? await handleImageToBase64(idFrontImage) : null;
        const personImageBase64 = personImage ? await handleImageToBase64(personImage) : null;

        try {
            const sessionId = localStorage.getItem('sessionId');
            // Send base64 strings in the body
            await axios.post('/api/verification/verify', {
                idFrontImage: idFrontImageBase64,
                personImage: personImageBase64,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`,
                },
            });
            setSuccess(true);
            router.push('/'); // Redirect to homepage on success
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return <div>Loading...</div>; // Show loading indicator while checking status
    }

    if (isVerified) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>You are already verified</h1>
                <button onClick={() => router.push('/')} className={styles.homeButton}>Go to Homepage</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Verify Your Identity</h1>
            <p className={`${styles.subtitle} ${styles.redText}`}>
                Note: This is a proof of concept. A third-party verification service will be used in the future. Currently, you can upload any images and it will verify your account successfully for demonstration purposes.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>Verification successful!</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.dropzone} {...getIdRootProps()}>
                    <input {...getIdInputProps()} />
                    <div className={styles.icon}>🪪</div> {/* Drag and drop symbol */}
                    {idFrontImage ? <p>{idFrontImage.name}</p> : <p>Drag 'n' drop your ID front image here, or click to select one</p>}
                </div>
                <div className={styles.dropzone} {...getPersonRootProps()}>
                    <input {...getPersonInputProps()} />
                    <div className={styles.icon}>🤳</div> {/* Drag and drop symbol */}
                    {personImage ? <p>{personImage.name}</p> : <p>Drag 'n' drop a picture of yourself here, or click to select one</p>}
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Uploading...' : 'Submit'}
                </button>
            </form>
            <button onClick={() => router.push('/')} className={styles.homeButton}>Go to Homepage</button>
        </div>
    );
};

export default Verify;
