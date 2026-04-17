// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';   // ✅ use the configured axios instance

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    bday: '',
    password: '',
    confirmPassword: '',
    level: '',
    gender: '',
    accountType: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.bday) {
      newErrors.bday = "Birthdate is required";
      isValid = false;
    } else {
      const today = new Date();
      const birthDate = new Date(formData.bday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.bday = "You must be 18 years old and above";
        isValid = false;
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (!formData.accountType) {
      newErrors.accountType = "Please select an account type";
      isValid = false;
    }

    if (!formData.terms) {
      alert("Please agree to the terms and conditions.");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ Use API instance (baseURL from env) instead of hardcoded localhost
      const { data } = await API.post('/auth/register', {
        name: formData.fullname,
        email: formData.email,
        password: formData.password
      });

      // Save token and user data (same as login)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      alert('Registration successful!');
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }

    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setApiError(message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="join-wrapper" style={{ maxWidth: '600px', margin: '2rem auto', background: 'white', borderRadius: '20px', padding: '2rem' }}>
        <div className="form-section">
          {apiError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{apiError}</p>}
          <form className="register-form" onSubmit={handleSubmit}>
            <label htmlFor="fullname">Full Name</label>
            <input 
              type="text" 
              id="fullname" 
              value={formData.fullname}
              onChange={handleChange}
            />
            {errors.fullname && <span className="error">{errors.fullname}</span>}

            <label htmlFor="username">Preferred Username</label>
            <input 
              type="text" 
              id="username" 
              value={formData.username}
              onChange={handleChange}
            />

            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <label htmlFor="bday">BirthDate</label>
            <input 
              type="date" 
              id="bday" 
              value={formData.bday}
              onChange={handleChange}
            />
            {errors.bday && <span className="error">{errors.bday}</span>}

            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

            <p>Interest Level:</p>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="level" 
                  value="beginner" 
                  checked={formData.level === 'beginner'}
                  onChange={handleRadioChange}
                /> Beginner
              </label>
              <label>
                <input 
                  type="radio" 
                  name="level" 
                  value="intermediate"
                  checked={formData.level === 'intermediate'}
                  onChange={handleRadioChange}
                /> Intermediate
              </label>
              <label>
                <input 
                  type="radio" 
                  name="level" 
                  value="expert"
                  checked={formData.level === 'expert'}
                  onChange={handleRadioChange}
                /> Expert
              </label>
            </div>

            <p>Gender:</p>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleRadioChange}
                /> Male
              </label>
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleRadioChange}
                /> Female
              </label>
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleRadioChange}
                /> Other
              </label>
            </div>
            {errors.gender && <span className="error">{errors.gender}</span>}

            <label htmlFor="accountType">Account Type</label>
            <select 
              id="accountType" 
              value={formData.accountType}
              onChange={handleChange}
            >
              <option value="">Select Account Type</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
            </select>
            {errors.accountType && <span className="error">{errors.accountType}</span>}

            <label className="checkbox">
              <input 
                type="checkbox" 
                id="terms" 
                checked={formData.terms}
                onChange={handleChange}
              /> I agree to the terms and conditions
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>

      <footer>
        <p>&copy; MiIlao. All rights reserved. | Contact: MiIlao@gmail.com</p>
      </footer>
    </>
  );
}

export default RegisterPage;