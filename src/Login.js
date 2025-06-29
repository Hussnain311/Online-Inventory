import React, { useState } from 'react';
import { 
  Avatar, 
  Button, 
  TextField, 
  Link, 
  Grid, 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Fade,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/inventory');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/inventory');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'auto',
        py: { xs: 2, md: 4 }
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          animation: 'float 7s ease-in-out infinite',
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} alignItems="center" sx={{ minHeight: { xs: 'auto', md: '80vh' } }}>
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <InventoryIcon sx={{ fontSize: { xs: 36, md: 48 }, mr: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}>
                    InventoryPro
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  Welcome Back! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Sign in to your account and take control of your inventory management
                </Typography>
                
                {/* Feature Highlights */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 2, fontSize: 24 }} />
                    <Typography variant="body1">Secure & Reliable</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 2, fontSize: 24 }} />
                    <Typography variant="body1">Real-time Analytics</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 2, fontSize: 24 }} />
                    <Typography variant="body1">Smart Inventory Tracking</Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1200}>
              <Paper 
                elevation={24} 
                sx={{ 
                  p: { xs: 3, md: 5 }, 
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                {/* Decorative Elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    opacity: 0.1
                  }}
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <Avatar 
                    sx={{ 
                      m: 2, 
                      bgcolor: 'primary.main',
                      width: { xs: 60, md: 80 },
                      height: { xs: 60, md: 80 },
                      boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                      border: '4px solid white'
                    }}
                  >
                    <LockOutlinedIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
                  </Avatar>
                  
                  <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    Sign In
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                    Access your inventory dashboard
                  </Typography>
                  
                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        width: '100%', 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                  
                  {/* Google Sign In Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    sx={{ 
                      py: 1.5,
                      mb: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      borderColor: '#4285f4',
                      color: '#4285f4',
                      '&:hover': {
                        borderColor: '#3367d6',
                        backgroundColor: 'rgba(66, 133, 244, 0.04)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                  </Button>
                  
                  <Divider sx={{ width: '100%', mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                  
                  <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || googleLoading}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || googleLoading}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                      <Grid item>
                        <Link 
                          href="#" 
                          variant="body2" 
                          onClick={() => navigate('/forgot-password')}
                          sx={{ 
                            textDecoration: 'none',
                            fontWeight: 500,
                            color: 'primary.main',
                            '&:hover': { 
                              textDecoration: 'underline',
                              color: 'primary.dark'
                            }
                          }}
                        >
                          Forgot password?
                        </Link>
                      </Grid>
                    </Grid>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading || googleLoading}
                      sx={{ 
                        py: 1.8,
                        mb: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                    
                    <Grid container justifyContent="center">
                      <Grid item>
                        <Typography variant="body2" color="text.secondary">
                          Don't have an account?{' '}
                          <Link 
                            href="#" 
                            variant="body2" 
                            onClick={() => navigate('/signup')}
                            sx={{ 
                              textDecoration: 'none',
                              fontWeight: 600,
                              color: 'primary.main',
                              '&:hover': { 
                                textDecoration: 'underline',
                                color: 'primary.dark'
                              }
                            }}
                          >
                            Create Account
                          </Link>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 