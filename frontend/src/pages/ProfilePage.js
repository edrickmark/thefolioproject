// frontend/src/pages/ProfilePage.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const imageBaseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      // If user has profilePic, use it; otherwise placeholder
      const picUrl = user.profilePic 
        ? `${imageBaseUrl}/uploads/${user.profilePic}`
        : 'https://via.placeholder.com/150';
      setProfilePicPreview(picUrl);
    }
  }, [user, imageBaseUrl]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicPreview(previewUrl);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('name', name);
    fd.append('bio', bio);
    if (profilePic) {
      fd.append('profilePic', profilePic);
    }

    try {
      const { data } = await API.put('/auth/profile', fd);
      // Update user context with new user data (data.user contains updated user)
      setUser(data.user);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      // Clear the file input state
      setProfilePic(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await API.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}
      
      {/* Profile Picture Section */}
      <form onSubmit={handleUpdateProfile}>
        <h3>Profile Picture</h3>
        <div className="profile-pic-wrapper">
          <img 
            src={profilePicPreview} 
            alt="Profile" 
            className="profile-pic-preview" 
          />
          <label htmlFor="profilePicInput" className="camera-icon-overlay">
            📷
          </label>
          <input
            id="profilePicInput"
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            style={{ display: 'none' }}
          />
        </div>
        
        <h3>Profile Information</h3>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
        
        <label>Bio:</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows="4"
        />
        
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
      
      {/* Change Password Section */}
      <form onSubmit={handleChangePassword}>
        <h3>Change Password</h3>
        
        <label>Current Password:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />
        
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password (min. 6 characters)"
          required
        />
        
        <label>Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        
        <button type="submit" className="save-btn" disabled={passwordLoading}>
          {passwordLoading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;