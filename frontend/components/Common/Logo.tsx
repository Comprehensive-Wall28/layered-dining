import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface LogoProps {
    open?: boolean; // If false, show only icon
    mobile?: boolean; // If true, optimize for mobile header
}

export default function Logo({ open = true, mobile = false }: LogoProps) {
    const theme = useTheme();

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            height: '40px',
            overflow: 'hidden',
        }}>
            {/* Vector Icon: 3 Stacked Layers representing "Layered Dining" */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M16 2L3 9L16 16L29 9L16 2Z"
                    fill={theme.palette.secondary.main}
                />
                <path
                    d="M3 14L16 21L29 14"
                    stroke={theme.palette.primary.main}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                />
                <path
                    d="M3 19L16 26L29 19"
                    stroke={theme.palette.secondary.main}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Text Part - hidden if collapsed and not mobile (though logic usually handled by parent calling open=false) */}
            {(open || mobile) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 800,
                            lineHeight: 1,
                            color: 'primary.main',
                            letterSpacing: '-0.5px',
                            fontSize: '1.2rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        LAYERED
                    </Typography>
                    <Typography
                        variant="caption"
                        component="div"
                        sx={{
                            fontWeight: 600,
                            lineHeight: 1,
                            color: 'secondary.main',
                            letterSpacing: '2px',
                            fontSize: '0.65rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        DINING
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
