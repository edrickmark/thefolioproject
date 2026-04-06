// frontend/src/pages/LoginPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const loggedInUser = await login(email, password);
      
      // Check user role and redirect accordingly
      if (loggedInUser && loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser) {
        navigate('/home');
      } else {
        setError('Login failed. No user data received.');
      }
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <h2>Login to Mi Ilao</h2>
      
      {error && <div className="error-msg">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input 
          type='email' 
          placeholder='Email address'
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        
        <input 
          type='password' 
          placeholder='Password'
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required
        />
        
        <button type='submit' disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p>
        Don't have an account? <Link to='/register'>Register here</Link>
      </p>
      
      <hr style={{ margin: '20px 0' }} />
      
     
    </div>
  );
};

export default LoginPage;