import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Container, Typography, Box, Alert, createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100vh',
          background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(100,100,100,1) 100%)',
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

export default function Login() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', { username, password });
      if (response.status === 200) {
        const sessionId = response.data.sessionId; // Assuming the session ID is returned in the response
        localStorage.setItem('sessionId', sessionId); // Store session ID in local storage
        router.push('/'); // Redirect to home page on successful login
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
          <Typography component="h1" variant="h5" sx={{ color: 'white' }}>
            Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputLabelProps={{ style: { color: 'white' } }}
              InputProps={{
                style: { color: 'white' },
                sx: {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                },
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ style: { color: 'white' } }}
              InputProps={{
                style: { color: 'white' },
                sx: {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                },
              }}
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
