import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message === 'Invalid login credentials') {
            setError('Invalid email address or password');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message === 'User already registered') {
            setError('This email address is already registered');
          } else {
            setError(error.message);
          }
        } else {
          setError('');
          alert('Registration successful! Please check your emails for confirmation.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-sand via-background to-travel-coral/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="w-12 h-12 bg-travel-turquoise rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-playfair text-3xl font-semibold text-foreground">
              Wanderlust
            </span>
          </motion.div>
          <p className="text-muted-foreground">
            {isLogin ? 'Welcome back!' : 'Start your adventure'}
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-border/50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field (Sign Up Only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-travel-turquoise hover:bg-travel-turquoise/90 text-white font-medium py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Don\'t have an account?' : 'Already registered?'}
            </p>
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-travel-turquoise hover:text-travel-turquoise/80 font-medium"
            >
              {isLogin ? 'Sign up now' : 'Sign in now'}
            </Button>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;