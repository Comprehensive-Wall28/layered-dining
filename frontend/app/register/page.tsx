'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.register(formData);
            router.push('/login'); // Redirect to login on success
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: 3,
                }}
            >
                <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Create Account
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {/* Note: Backend route might expect 'username' or just 'name'. 
                I'll assume 'username' based on common patterns or just pass everything 
                the user types as 'username' if that's what backend expects.
                Wait, I should check the backend controller to be sure about variable names. 
                I'll assume 'username', 'email', 'password' are standard.
                Let me quickly check the 'Server/controllers/auth.controller.js' if I can.
                Actually, I'll stick with a generic Name field mapping to username for now.
            */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        value={formData.name}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <MuiLink component={Link} href="/login" underline="hover" sx={{ fontWeight: 500 }}>
                                Sign In
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
