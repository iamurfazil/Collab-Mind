import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FirebaseError } from 'firebase/app';
import { useStore } from '../store';
import { 
  Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle,
  AlertCircle, Loader2
} from 'lucide-react';
import Canvas3D from '../components/Canvas3D';

type Role = 'owner' | 'builder';
type Profession = 'student' | 'freelancer' | 'professional';

type AuthFormData = {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  profession: Profession;
  collegeName: string;
  stream: string;
  courseYear: string;
  semester: string;
  orgName: string;
  city: string;
  state: string;
};

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginWithGoogle, register, resetPassword, darkMode, addNotification, updateUser } = useStore();
  
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV
      ? 'http://localhost:5000'
      : 'https://collabmind-backend-995242116294.asia-south1.run.app');

  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    displayName: '',
    role: 'builder',
    profession: 'student',
    collegeName: '',
    stream: '',
    courseYear: '1',
    semester: '1',
    orgName: '',
    city: '',
    state: ''
  });



  const getFirebaseLoginErrorMessage = (error: unknown) => {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return 'Incorrect password. Please try again.';
      }
      if (error.code === 'auth/user-not-found') {
        return 'No account found with this email.';
      }
      if (error.code === 'auth/invalid-email') {
        return 'Please enter a valid email address.';
      }
      if (error.code === 'auth/too-many-requests') {
        return 'Too many login attempts. Please try again later.';
      }
    }
    return 'Unable to sign in right now. Please try again.';
  };

  const getResetPasswordErrorMessage = (error: unknown) => {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/user-not-found') {
        return 'No account found with this email address.';
      }
      if (error.code === 'auth/network-request-failed') {
        return 'Network issue detected. Please check your connection and try again.';
      }
      if (error.code === 'auth/invalid-email') {
        return 'Please enter a valid email address.';
      }
    }
    return 'Failed to send reset email. Please try again.';
  };

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') setMode('register');
    else if (modeParam === 'reset') setMode('reset');
    else setMode('login');
  }, [searchParams]);

  const semesterOptions = (year: string) => {
    const base = (parseInt(year) - 1) * 2;
    return [
      { value: String(base + 1), label: `Semester ${base + 1}` },
      { value: String(base + 2), label: `Semester ${base + 2}` },
    ];
  };

  const handleYearChange = (year: string) => {
    const firstSem = String((parseInt(year) - 1) * 2 + 1);
    setFormData({ ...formData, courseYear: year, semester: firstSem });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData.email, formData.password);
      if (result) {
        const currentUser = useStore.getState().user;
        if (currentUser?.role === 'admin') {
          addNotification('Welcome Admin!', 'success');
          navigate('/admin');
        } else {
          addNotification('Welcome back!', 'success');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(getFirebaseLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await loginWithGoogle();
      if (result) {
        const currentUser = useStore.getState().user;
        if (currentUser?.role === 'admin') {
          addNotification('Welcome Admin!', 'success');
          navigate('/admin');
        } else if (currentUser && (!currentUser.city || !currentUser.role)) {
          setShowGoogleSetup(true);
        } else if (currentUser) {
          addNotification('Welcome back!', 'success');
          navigate('/dashboard');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred with Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await updateUser({
        role: formData.role,
        profession: formData.profession,
        collegeName: formData.collegeName,
        stream: formData.profession === 'student' ? formData.stream : undefined,
        courseYear: formData.profession === 'student' ? formData.courseYear : undefined,
        semester: formData.profession === 'student' ? formData.semester : undefined,
        orgName: formData.profession === 'professional' ? formData.orgName : undefined,
        city: formData.city,
        state: formData.state
      });
      addNotification('Account setup complete!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP.');
      }

      setOtpSent(true);
      setOtp('');
      setOtpVerified(false);
      addNotification('OTP sent to your email!', 'info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Invalid OTP.');
      }

      setOtpVerified(true);
      setOtpSent(false);
      setOtp('');
      setError('');
      addNotification('Email verified successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otpVerified) {
      setError('Please verify your email with OTP before creating an account.');
      setLoading(false);
      return;
    }

    if (!formData.displayName.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    
    try {
      await register(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role
      );
      await updateUser({
        role: formData.role,
        profession: formData.profession,
        collegeName: formData.collegeName,
        stream: formData.profession === 'student' ? formData.stream : undefined,
        courseYear: formData.profession === 'student' ? formData.courseYear : undefined,
        semester: formData.profession === 'student' ? formData.semester : undefined,
        orgName: formData.profession === 'professional' ? formData.orgName : undefined,
        city: formData.city,
        state: formData.state
      });
      addNotification('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await resetPassword(formData.email);
      setSuccess('Password reset link sent to your email!');
    } catch (err) {
      setError(getResetPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setOtp('');
    setOtpVerified(false);
  };

  return (
    <div className="h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas3D />
        <div className={`absolute inset-0 ${
          darkMode ? 'bg-titanium-950/40' : 'bg-white/10'
        } backdrop-blur-[2px]`} />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md my-auto glass p-8 rounded-3xl border border-white/20 shadow-2xl"
        >
          {showGoogleSetup ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Profile</h2>
                <p className="text-gray-500">Just a few more details to set up your account.</p>
              </div>

              <form onSubmit={handleCompleteGoogleSetup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">City</label>
                    <input type="text" required value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="e.g. Nagpur" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">State</label>
                    <input type="text" required value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="e.g. Maharashtra" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">I want to join as</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900">
                    <option value="builder">Problem Solver (Builder)</option>
                    <option value="owner">Problem Owner</option>
                  </select>
                </div>

                {formData.role === 'builder' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">I am a</label>
                      <select value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value as Profession })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900">
                        <option value="student">Student</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="professional">Working Professional</option>
                      </select>
                    </div>

                    {formData.profession === 'student' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">College Name</label>
                          <input type="text" required value={formData.collegeName}
                            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="Your University / College" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Stream / Course</label>
                          <input type="text" required value={formData.stream}
                            onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="e.g. B.Tech, B.Sc, BA" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Year of Study</label>
                            <select
                              value={formData.courseYear}
                              onChange={(e) => handleYearChange(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900"
                            >
                              <option value="1">1st Year</option>
                              <option value="2">2nd Year</option>
                              <option value="3">3rd Year</option>
                              <option value="4">4th Year</option>
                              <option value="5">5th Year</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Semester</label>
                            <select
                              value={formData.semester}
                              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900"
                            >
                              {semesterOptions(formData.courseYear).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {formData.profession === 'professional' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Organization Name</label>
                        <input type="text" required value={formData.orgName}
                          onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                          placeholder="Where do you work?" />
                      </div>
                    )}
                  </motion.div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">{error}</span>
                  </motion.div>
                )}

                <motion.button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-2xl shadow-sm hover:shadow-md transition-all btn-shine cursor-hover disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</> : 'Complete Setup'}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'reset' && 'Reset Password'}
                </h1>
                <p className="text-gray-500">
                  {mode === 'login' && 'Sign in to continue your journey'}
                  {mode === 'register' && 'Join the community of problem solvers'}
                  {mode === 'reset' && 'Recover your account'}
                </p>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset}>
                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                        <input type="text" required value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                          placeholder="John Doe" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">City</label>
                          <input type="text" required value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="e.g. Nagpur" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">State</label>
                          <input type="text" required value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="e.g. Maharashtra" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">I want to join as</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900">
                          <option value="builder">Problem Solver (Builder)</option>
                          <option value="owner">Problem Owner</option>
                        </select>
                      </div>

                      {formData.role === 'builder' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">I am a</label>
                            <select value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value as Profession })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900">
                              <option value="student">Student</option>
                              <option value="freelancer">Freelancer</option>
                              <option value="professional">Working Professional</option>
                            </select>
                          </div>

                          {formData.profession === 'student' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">College Name</label>
                                <input type="text" required value={formData.collegeName}
                                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                                  placeholder="Your University / College" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Stream / Course</label>
                                <input type="text" required value={formData.stream}
                                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                                  placeholder="e.g. B.Tech, B.Sc, BA" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-2">Year of Study</label>
                                  <select
                                    value={formData.courseYear}
                                    onChange={(e) => handleYearChange(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900"
                                  >
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                    <option value="5">5th Year</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-2">Semester</label>
                                  <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 outline-none text-gray-900"
                                  >
                                    {semesterOptions(formData.courseYear).map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formData.profession === 'professional' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">Organization Name</label>
                              <input type="text" required value={formData.orgName}
                                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                                placeholder="Where do you work?" />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" required value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (mode === 'register') {
                            setOtpVerified(false);
                            setOtpSent(false);
                            setOtp('');
                          }
                        }}
                        disabled={mode === 'register' && otpVerified}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="you@example.com" />
                    </div>
                    {mode === 'register' && !otpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!formData.email || otpLoading}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors whitespace-nowrap disabled:opacity-50 cursor-hover"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? 'Resend' : 'Get OTP'}
                      </button>
                    )}
                  </div>
                  {mode === 'register' && otpVerified && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Email verified
                    </motion.p>
                  )}
                </div>

                <AnimatePresence>
                  {mode === 'register' && otpSent && !otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <label className="block text-sm font-medium text-gray-600 mb-2">Enter Verification Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 tracking-[0.5em] font-mono text-center text-lg placeholder-gray-300"
                          placeholder="000000"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 6 || otpLoading}
                          className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors disabled:opacity-50 cursor-hover"
                        >
                          {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {mode !== 'reset' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} required value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors cursor-hover">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{success}</span>
                  </motion.div>
                )}

                <motion.button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-2xl shadow-sm hover:shadow-md transition-all btn-shine cursor-hover disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</>
                  ) : (
                    <>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Create Account'}
                      {mode === 'reset' && 'Send Reset Link'}
                    </>
                  )}
                </motion.button>

                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('reset')}
                    className="w-full mt-4 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                    Forgot your password?
                  </button>
                )}
              </form>

              <div className="my-4 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <motion.button type="button" onClick={handleGoogleLogin} disabled={loading}
                className="w-full py-3 px-4 bg-white rounded-2xl font-medium flex items-center justify-center gap-3 cursor-hover disabled:opacity-50 text-gray-900 border border-gray-300 shadow-sm hover:bg-gray-50 transition-all"
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>

              <div className="mt-6 text-center">
                {mode === 'login' && (
                  <p className="text-gray-500">Don't have an account?{' '}
                    <button onClick={() => switchMode('register')} className="text-orange-500 hover:text-orange-600 font-bold cursor-hover transition-colors">Sign up</button>
                  </p>
                )}
                {mode === 'register' && (
                  <p className="text-gray-500">Already have an account?{' '}
                    <button onClick={() => switchMode('login')} className="text-orange-500 hover:text-orange-600 font-bold cursor-hover transition-colors">Sign in</button>
                  </p>
                )}
                {mode === 'reset' && (
                  <button onClick={() => switchMode('login')} className="text-orange-500 hover:text-orange-600 font-medium flex items-center justify-center gap-2 cursor-hover w-full">
                    <ArrowLeft className="w-4 h-4" /> Back to login
                  </button>
                )}
              </div>

              <div className="mt-6 text-center">
                <Link to="/" className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-all duration-300 cursor-hover">
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Visual Side - Upgraded with Opaque Background to block animations */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-white-500 z-20">
        <div className="relative z-10 text-center p-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-[450px] h-[450px] mx-auto mb-8 relative flex items-center justify-center"
          >
            {/* The actual floating branding image */}
            <motion.img 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              src="/collabmindex.png" 
              className="h-full object-contain drop-shadow-[0_35px_35px_rgba(249,115,22,0.3)] z-20" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              Build the <span className="gradient-text">Future</span>
            </h2>
            <p className="text-gray-900 max-w-md font-medium">
              Join thousands of problem owners and talented builders creating impact together.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}