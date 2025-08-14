'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const AuthTest = () => {
  const [user, loading, error] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ User signed up successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ User signed in successfully');
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error.message);
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful');
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error.message);
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="animate-pulse">Loading authentication...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Authenticated!</h2>
        <div className="space-y-3">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>UID:</strong> {user.uid}</p>
          <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
          <p><strong>Photo URL:</strong> {user.photoURL ? 'Set' : 'Not set'}</p>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔐 Authentication Test</h2>
      
      <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="signup"
            checked={isSignUp}
            onChange={(e) => setIsSignUp(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="signup" className="text-sm text-gray-700">
            Sign up instead of sign in
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          {isSignUp ? 'Sign Up' : 'Sign In'} with Email
        </button>
      </form>
      
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
      
      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
      >
        Sign In with Google
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default AuthTest;
