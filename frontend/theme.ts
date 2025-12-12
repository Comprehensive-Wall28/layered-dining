'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 600,
        }
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#1a1a1a',
        },
        secondary: {
            main: '#c5a059', // Muted Gold
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#2b2b2b',
            secondary: '#555555'
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '10px 24px',
                    textTransform: 'none',
                    fontSize: '1rem',
                },
                containedPrimary: {
                    backgroundColor: '#1a1a1a',
                    '&:hover': {
                        backgroundColor: '#333333',
                    }
                }
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                }
            }
        }
    },
});

export default theme;
