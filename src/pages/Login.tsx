import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, hashPassword } from "../store";
import { Lock, User, UserPlus } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [shopNameInput, setShopNameInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  const { users, registerInitialAdmin, register, login, resetPassword, updateShopName } = useStore();
  const [isSignUp, setIsSignUp] = useState(users.length === 0);
  
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasNonalphas = /\W/.test(pwd);
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
      return "Password must contain uppercase, lowercase, numbers, and special characters.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const pwdError = validatePassword(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
      
      if (users.length === 0) {
        registerInitialAdmin(email, hashPassword(password), username);
      } else {
        if (users.some(u => u.username === username)) {
          setError("Username is already taken.");
          return;
        }
        register(email, hashPassword(password), username);
      }

      if (shopNameInput) {
        updateShopName(shopNameInput);
      }

      // Log them in immediately
      const user = login(email, hashPassword(password));
      if (user) {
        setSuccessMsg(`Account created. Check your email.`);
        alert(`📧 NEW EMAIL\n\nTo: ${email}\n\nWelcome to our platform! Your registration is complete.`);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } else {
      const hashed = hashPassword(password);
      const user = login(email, hashed);
      
      if (user) {
        setSuccessMsg(`Welcome back. Logging in...`);
        alert(`📧 NEW EMAIL\n\nTo: ${email}\n\nNew sign-in detected on your account.`);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    const userExists = users.some(u => u.email === email);
    if (!userExists) {
      setError("No account found with this email.");
    } else {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpExpiry(Date.now() + 2 * 60 * 1000); // 2 minutes from now
      setSuccessMsg(`OTP sent to ${email}`);
      alert(`📧 NEW EMAIL\n\nTo: ${email}\n\nYour Password Reset OTP is: ${code}\nThis OTP is valid for 2 minutes.\n\nPlease enter this code to reset your password.`);
      setOtpSent(true);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otpExpiry || Date.now() > otpExpiry) {
      setError("OTP has expired. Please request a new one.");
      return;
    }
    
    if (otp !== generatedOtp) {
      setError("Invalid OTP.");
      return;
    }
    
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    resetPassword(email, hashPassword(newPassword));
    setSuccessMsg("Password reset successfully. You can now login.");
    setIsForgotPassword(false);
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setPassword("");
    setGeneratedOtp("");
    setOtpExpiry(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-indigo-600 p-4 shadow-lg shadow-indigo-200">
            {isSignUp ? <UserPlus className="h-8 w-8 text-white" /> : <Lock className="h-8 w-8 text-white" />}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-slate-800 tracking-tight">
          {isSignUp ? "Create an Account" : "Welcome back"}
        </h2>
        {isSignUp && users.length === 0 ? (
          <p className="mt-2 text-center text-sm text-slate-500">
            Create the primary administrator account to get started.
          </p>
        ) : users.length === 1 && users[0].email === "admin@example.com" ? (
          <p className="mt-2 text-center text-sm text-slate-500">
            Default credentials: <span className="font-bold text-indigo-600">admin@example.com / admin</span>
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-slate-500">
            {isSignUp ? "Sign up to access ShopSync." : "Sign in to continue to ShopSync."}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 p-4 rounded-lg text-center border border-red-100 mb-4">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100 mb-4">
              {successMsg}
            </div>
          )}

          {isForgotPassword ? (
            <form className="space-y-6" onSubmit={otpSent ? handleResetPassword : handleForgotPassword}>
              <div>
                <label htmlFor="emailForgot" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="emailForgot"
                    name="email"
                    type="email"
                    required
                    disabled={otpSent}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      OTP Code
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPasswordReset" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="confirmPasswordReset"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] uppercase tracking-wider"
                >
                  {otpSent ? "Reset Password" : "Send OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setOtpSent(false);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="w-full flex justify-center py-3.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all uppercase tracking-wider"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
            
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="shopNameInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">
                    Shop Name
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="shopNameInput"
                      name="shopNameInput"
                      type="text"
                      required
                      value={shopNameInput}
                      onChange={(e) => setShopNameInput(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                      placeholder="Enter Shop Name"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 p-3 transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {!isSignUp && !isForgotPassword && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wider"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] uppercase tracking-wider"
              >
                {isSignUp ? "Sign Up" : "Sign in"}
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
