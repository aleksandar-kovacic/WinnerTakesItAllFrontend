import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Button,
  Container,
  Box,
  Modal,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const formatDate = (dateString: number) => {
  return new Date(dateString).toLocaleString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(',', '');
};

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100vh',
          background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(34,34,34,1) 50%, rgba(54,54,54,1) 100%)',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundPosition: '0 0, 25px 25px',
          backgroundColor: 'black',
        },
        html: {
          height: '100vh',
        },
      },
    },
  },
});

const HomePage = () => {
  const [open, setOpen] = useState(false); // Payment modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false); // Auth modal state
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [prizeAndOdds, setPrizeAndOddsAndDate] = useState({ prize: 0, odds: '', date: 0 });
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const response = await axios.get('/api/users/auth/status');
        setIsLoggedIn(response.data.loggedIn);

        if (response.data.loggedIn) {
          const participationResponse = await axios.get('/api/payments/status');
          setIsParticipating(participationResponse.data.paid);
        }
      } catch (error) {
        console.error('Error fetching auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrizeAndOdds = async () => {
      try {
        const response = await axios.get('/api/games/information');
        setPrizeAndOddsAndDate({ prize: response.data.prizePool * 0.8, odds: response.data.prizePool, date: response.data.endDate });
      } catch (error) {
        console.error('Error fetching prize and odds:', error);
      }
    };

    fetchAuthStatus();
    fetchPrizeAndOdds();
  }, []);

  if (loading) {
    return null;
  }

  const handleOpenPaymentModal = async () => {
    if (isLoggedIn) {
      try {
        const verificationResponse = await axios.get('/api/verification/status');
        const isVerified = verificationResponse.data.verified;

        if (!isVerified) {
          setVerificationModalOpen(true); // Open verification modal
          return;
        }

        const banResponse = await axios.get('/api/ban/status');
        const isBanned = banResponse.data.banned;

        if (isBanned) {
          setBanModalOpen(true); // Open ban modal
          return;
        }

        const paymentResponse = await axios.get('/api/payments/status');
        const isPaid = paymentResponse.data.paid;

        if (isPaid) {
          setPaymentModalOpen(true);
          return;
        }

        setOpen(true); // Open payment modal if verified and not banned
      } catch (error) {
        console.error('Error checking verification or ban status:', error);
      }
    } else {
      setAuthModalOpen(true); // Open login/register modal
    }
  };

  const handlePaymentMethodSelect = async (paymentMethod: string) => {
    const sessionId = localStorage.getItem('sessionId'); // Retrieve session ID from local storage
  
    if (!sessionId) {
      console.error('Session ID not found');
      return;
    }
  
    try {
      const response = await fetch('api/payments/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`, // Use session ID as the token
        },
        body: JSON.stringify({ paymentMethod }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Payment successful:', data.message);
        // Handle successful payment and participation
      } else {
        const errorData = await response.json();
        console.error('Payment failed:', errorData.message);
        // Handle payment failure
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle network or other errors
    }
    setPaymentModalOpen(false);
    window.location.reload();
  };

  const handleCloseModals = () => {
    setOpen(false);
    setAuthModalOpen(false);
    setVerificationModalOpen(false);
    setBanModalOpen(false);
    setPaymentModalOpen(false);
  };

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleLogout = () => {
    axios.post('/api/users/logout')
      .then(() => {
        setIsLoggedIn(false);
        setDrawerOpen(false);
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const router = useRouter();
  const paymentOptions = ['Credit Card', 'PayPal', 'Google Pay', 'Apple Pay'];
  const settingsMenu = ['Verification', 'Ban'];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        {isLoggedIn && isParticipating && (
          <Typography variant="h6" sx={{ color: 'green', marginBottom: '16px', textAlign: 'center' }}>
            You are participating. Good Luck! The winner will be announced per email.
          </Typography>
        )}
        {isLoggedIn ? (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              fontSize: '2rem',
            }}
          >
            <SettingsIcon />
          </IconButton>
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ backgroundColor: '#1976d2' }}
              onClick={() => window.location.href = '/login'}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={() => window.location.href = '/register'}
            >
              Register
            </Button>
          </Box>
        )}

        <Typography
          variant="h5"
          sx={{
            color: 'gray',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          Winner Takes It All<br />
          JACKPOT - {Number(prizeAndOdds.prize).toFixed(2)}€<br />
          Ends on {formatDate(prizeAndOdds.date)}
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #D4AF37 30%, #FFD700 90%)',
            color: 'white',
            fontSize: '1.5rem',
            padding: '16px 32px',
            minWidth: '150px',
            minHeight: '60px',
            borderRadius: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              background: 'linear-gradient(45deg, #FFD700 30%, #D4AF37 90%)',
            },
          }}
          onClick={handleOpenPaymentModal}
        >
          1€
        </Button>
        <Typography
          variant="h6"
          sx={{
            color: 'gray',
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          Odds - 1 in {prizeAndOdds.odds}<br />
          Fee - 20%
        </Typography>

        {/* Authentication Modal */}
        <Modal
          open={authModalOpen}
          onClose={handleCloseModals}
          aria-labelledby="auth-modal-title"
          aria-describedby="auth-modal-description"
        >
          <Box
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModals}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="auth-modal-title" variant="h6" component="h2">
              Please Log In or Register
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                sx={{ backgroundColor: '#1976d2' }}
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{ color: 'white', borderColor: 'white', backgroundColor: 'black' }}
                onClick={() => window.location.href = '/register'}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Verification Modal */}
        <Modal
          open={verificationModalOpen}
          onClose={handleCloseModals}
          aria-labelledby="verification-modal-title"
          aria-describedby="verification-modal-description"
        >
          <Box
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModals}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="verification-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center' }}>
              You are not verified yet
            </Typography>
            <Typography id="verification-modal-description" sx={{ mt: 2 , textAlign: 'center' }}>
              Please verify your account to proceed with the payment:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/verify'}
                sx={{ backgroundColor: 'black', color: 'white' }}
              >
                Verify Here
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Ban Modal */}
        <Modal
          open={banModalOpen}
          onClose={handleCloseModals}
          aria-labelledby="ban-modal-title"
          aria-describedby="ban-modal-description"
        >
          <Box
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModals}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="ban-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center' }}>
              You are banned
            </Typography>
            <Typography id="ban-modal-description" sx={{ mt: 2, textAlign: 'center' }}>
              You can unban yourself by following:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/ban'}
                sx={{ backgroundColor: 'black', color: 'white' }}
              >
                Unban Here
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* isPaid Modal */}
        <Modal
          open={paymentModalOpen}
          onClose={handleCloseModals}
          aria-labelledby="ispaid-modal-title"
          aria-describedby="ispaid-modal-description"
        >
          <Box
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModals}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="ispaid-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center' }}>
              You are already participating.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleCloseModals}
                sx={{ backgroundColor: 'black', color: 'white' }}
              >
                OK
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Payment Modal */}
        <Modal
          open={open}
          onClose={handleCloseModals}
          aria-labelledby="payment-modal-title"
          aria-describedby="payment-modal-description"
        >
          <Box
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" id="payment-modal-title">
              Select Payment Method
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {paymentOptions.map((option) => (
                <Button
                  key={option}
                  variant="outlined"
                  onClick={() => handlePaymentMethodSelect(option)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Box>
        </Modal>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              backgroundColor: '#333333',
              color: 'white',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
            <Typography variant="h6">Settings</Typography>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
          <List>
            {settingsMenu.map((item) => (
              <ListItem
                key={item}
                component="button"
                onClick={() => {
                  if (item === 'Verification') {
                    router.push('/verify');
                  } else if (item === 'Ban') {
                    router.push('/ban');
                  } else {
                    alert(`Selected: ${item}`);
                  }
                }}
              >
                <ListItemText primary={item} />
              </ListItem>
            ))}
            {isLoggedIn && (
              <ListItem
                component="button"
                onClick={handleLogout}
                sx={{
                  color: 'red',
                  '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.2)' },
                }}
              >
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
        </Drawer>
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;
