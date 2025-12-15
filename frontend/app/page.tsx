'use client';

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableBarIcon from '@mui/icons-material/TableBar';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useAuth();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', flexDirection: 'column', display: 'flex' }}>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        height: '80vh',
        width: '100%',
        background: 'radial-gradient(circle at center, #E1F5FE 0%, #B3E5FC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center', color: 'text.primary' }}>
          <Typography variant="h1" gutterBottom sx={{ color: 'primary.main' }}>
            Experience Dining Layers
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4, color: 'text.secondary' }}>
            A culinary journey through taste, texture, and tradition.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<TableBarIcon />}
              component={Link}
              href="/reservation"
            >
              Reserve a Table
            </Button>
            <Button
              variant="outlined"
              sx={{ color: 'primary.main', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(0,0,0,0.05)' } }}
              size="large"
              startIcon={<DeliveryDiningIcon />}
              component={Link}
              href="/menu"
            >
              Order Online
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2 }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', mb: 2 }}>
                <TableBarIcon fontSize="large" />
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Real-time Reservations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Book your perfect table instantly. View availability and manage your booking with ease.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2 }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'secondary.main', color: 'white', mb: 2 }}>
                <DeliveryDiningIcon fontSize="large" />
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Online Ordering
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enjoy our exquisite menu from the comfort of your home. Fast, reliable delivery.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2 }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', mb: 2 }}>
                <RestaurantMenuIcon fontSize="large" />
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Curated Menu
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Explore seasonal ingredients crafted into masterpieces by our world-class chefs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonial */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <FormatQuoteIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
          <Typography variant="h4" fontStyle="italic" gutterBottom>
            "The best dining experience in the city. Every layer reveals a new surprise."
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
            - Food Critic Daily
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h6" gutterBottom>
                LayeredDining
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                123 Culinary Ave,<br />
                Gourmet District, NY 10012
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h6" gutterBottom>
                Hours
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Mon-Sun: 11:00 AM - 11:00 PM<br />
                Happy Hour: 4:00 PM - 7:00 PM
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h6" gutterBottom>
                Connect
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ color: 'white' }}><InstagramIcon /></IconButton>
                <IconButton sx={{ color: 'white' }}><TwitterIcon /></IconButton>
                <IconButton sx={{ color: 'white' }}><FacebookIcon /></IconButton>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ pt: 4, mt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              © {new Date().getFullYear()} LayeredDining. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
