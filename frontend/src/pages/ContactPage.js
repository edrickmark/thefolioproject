// frontend/src/pages/ContactPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Get name and email from user if logged in, otherwise from form
    const senderName = user?.name || formData.senderName.trim();
    const senderEmail = user?.email || formData.senderEmail.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();
    
    if (!senderName || !senderEmail || !subject || !message) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    
    try {
      await API.post('/messages', {
        senderName,
        senderEmail,
        subject,
        message
      });
      
      setSuccess('Message sent successfully! The admin will respond soon.');
      setFormData({ senderName: '', senderEmail: '', subject: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content-wrapper">
      <section>
        <h2>Contact Us</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Send us a message and we'll get back to you soon.
        </p>
        
        {error && <div className="error-msg" style={{ color: 'red', padding: '10px', background: '#ffebee', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
        {success && <div className="success-msg" style={{ color: 'green', padding: '10px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '15px' }}>{success}</div>}
        
        <form className="contact-form" onSubmit={handleSubmit}>
          {!user && (
            <>
              <label htmlFor="senderName">Name:</label>
              <input 
                type="text" 
                id="senderName" 
                placeholder="Your full name"
                value={formData.senderName}
                onChange={handleChange}
                required 
              />

              <label htmlFor="senderEmail">Email:</label>
              <input 
                type="email" 
                id="senderEmail" 
                placeholder="Your email address"
                value={formData.senderEmail}
                onChange={handleChange}
                required 
              />
            </>
          )}

          <label htmlFor="subject">Subject:</label>
          <input 
            type="text" 
            id="subject" 
            placeholder="What is your message about?"
            value={formData.subject}
            onChange={handleChange}
            required 
          />

          <label htmlFor="message">Message:</label>
          <textarea 
            id="message" 
            rows="6" 
            placeholder="Write your message here..."
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Top Learning Resources</h2>
        <table>
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://amysmooc.wordpress.com/" target="_blank" rel="noopener noreferrer">AmusEd</a></td>
              <td>This is a classic example of a "metaphor-based" portfolio.</td>
            </tr>
            <tr>
              <td><a href="https://blogs.ubc.ca/" target="_blank" rel="noopener noreferrer">UBC Blogs</a></td>
              <td>This student used the metaphor of a Campfire to represent their education.</td>
            </tr>
            <tr>
              <td><a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer">Canva</a></td>
              <td>Excellent for students who want to use heavy visual imagery to anchor their portfolio.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Campus Location</h2>
        <div className="map-placeholder">
          <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600" alt="A static map placeholder" />
        </div>
      </section>

      <footer>
        <p>&copy; MiIlao. All rights reserved. | Contact: MiIlao@gmail.com</p>
      </footer>
    </main>
  );
}

export default ContactPage;