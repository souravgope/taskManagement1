import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      // Dev: API returns token in response so we can test reset flow
      if (res.data.resetToken) {
        setToken(res.data.resetToken);
        setMessage('Reset token generated (dev). Use the link below to reset your password.');
      } else {
        setMessage(res.data.message || 'If an account exists, a reset link has been sent');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mb-6 text-gray-600">Enter your account email and we'll send a reset link.</p>

        {message && (
          <div className="p-3 mb-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded">
            {message}
            {token && (
              <div className="mt-2">
                <div className="text-xs text-gray-600">Dev token:</div>
                <div className="break-all text-xs font-mono text-gray-800">{token}</div>
                <div className="mt-3">
                  <a href={`/reset-password?token=${token}`} className="text-blue-600 hover:underline">Go to reset page</a>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Requesting...' : 'Send reset link'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
