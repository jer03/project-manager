import React, { useState } from 'react';
import { signInWithGoogle, signIn } from './auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/homepage');
    } catch (error) {
      setError("Invalid email/password");
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithGoogle();
      navigate('/homepage');
    } catch (error) {
      setError("Error signing in with Google");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="w-full bg-blue-400 text-white p-2 rounded">
          Login
        </button>
        </form>
      <button
        onClick={handleGoogleSignIn}
        className="mt-4 w-full bg-red-500 text-white p-2 rounded"
      >
        Sign in with Google
      </button>
      {error && <p className="text-red-500 mt-3">{error}</p>}
      <div className="mt-4 text-center">
          <Link to="/signup" className="text-blue-500 hover:underline">
            Create an account
          </Link>
        </div>
    </div>
  </div>
  );
};

export default Login;
