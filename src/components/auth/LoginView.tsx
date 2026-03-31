import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../ui';
import {
  clinicLogin,
  verifyEmailOtp,
  setAuthState,
  type ClinicProfile
} from '../../services/authService';

interface LoginViewProps {
  onLoginSuccess: (profile: ClinicProfile) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await clinicLogin(email, password);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const profile = await verifyEmailOtp(email, otp);
      await setAuthState(profile);
      onLoginSuccess(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Logo + heading */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">D</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          {step === 'credentials' ? 'Clinic Login' : 'Verify OTP'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {step === 'credentials'
            ? 'Sign in to your VDocs clinic account'
            : `A 6-digit code was sent to ${email}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'credentials' ? (
          <motion.form
            key="credentials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleCredentialsSubmit}
            className="space-y-4"
          >
            <Input
              label="Email"
              type="email"
              placeholder="clinic@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              leftIcon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              leftIcon={<Lock className="w-5 h-5" />}
              error={error}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Sending OTP…' : 'Continue'}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleOtpSubmit}
            className="space-y-4"
          >
            <Input
              label="One-Time Password"
              type="text"
              inputMode="numeric"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(''); }}
              leftIcon={<KeyRound className="w-5 h-5" />}
              error={error}
              maxLength={6}
              autoComplete="one-time-code"
            />
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Verifying…' : 'Verify & Login'}
            </Button>
            <button
              type="button"
              onClick={() => { setStep('credentials'); setError(''); setOtp(''); }}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
