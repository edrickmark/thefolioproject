// frontend/src/pages/AdminPage.js - Add this to existing file
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages'); // Changed default to messages
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab]);

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/admin/posts');
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all members
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/messages');
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read
  const markAsRead = async (id) => {
    try {
      await API.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  // Reply to message
  const handleReply = async (id) => {
    if (!replyMessage.trim()) return;
    
    try {
      await API.put(`/messages/${id}/reply`, { reply: replyMessage });
      setSuccess('Reply sent successfully!');
      setReplyingTo(null);
      setReplyMessage('');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Delete message
  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await API.delete(`/messages/${id}`);
      setSuccess('Message deleted successfully');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete message');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Remove post
  const handleRemovePost = async (id) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;
    
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setSuccess('Post removed successfully');
      fetchPosts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove post');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Start editing a post
  const handleStartEdit = (post) => {
    setEditingId(post._id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditImage(null);
    setEditImagePreview(post.image ? `http://localhost:5000/uploads/${post.image}` : null);
  };

  // Handle image selection for editing
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save edited post
  const handleSavePost = async (id) => {
    if (!editTitle.trim() || !editBody.trim()) {
      setError('Title and body are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('body', editBody);
      if (editImage) {
        formData.append('image', editImage);
      }

      await API.put(`/admin/posts/${id}/edit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Post updated successfully');
      setEditingId(null);
      fetchPosts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditBody('');
    setEditImage(null);
    setEditImagePreview('');
  };

  // Toggle user status
  const handleToggleUserStatus = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await API.put(`/admin/users/${id}/status`);
      setSuccess(`User ${action}d successfully`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
          {unreadCount > 0 && (
            <div className="unread-badge">
              📬 {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span className="tab-icon">📬</span>
            Messages
            {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="tab-icon">📝</span>
            All Posts
            <span className="tab-count">{posts.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👥</span>
            Members
            <span className="tab-count">{users.length}</span>
          </button>
        </div>

        {/* Messages */}
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {/* Loading State */}
        {loading && (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* Messages Tab Content */}
        {!loading && activeTab === 'messages' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Messages from Users</h2>
              <p>View and respond to user inquiries</p>
            </div>
            
            {messages.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map(msg => (
                  <div key={msg._id} className={`message-card ${msg.status}`} onClick={() => msg.status === 'unread' && markAsRead(msg._id)}>
                    <div className="message-header">
                      <div className="sender-info">
                        <div className="sender-avatar">
                          {msg.sender?.profilePic ? (
                            <img src={`http://localhost:5000/uploads/${msg.sender.profilePic}`} alt={msg.senderName} />
                          ) : (
                            <div className="avatar-placeholder-small">{msg.senderName?.charAt(0) || 'U'}</div>
                          )}
                        </div>
                        <div className="sender-details">
                          <h3>{msg.senderName}</h3>
                          <p className="sender-email">{msg.senderEmail}</p>
                          <p className="message-subject">Subject: {msg.subject}</p>
                        </div>
                      </div>
                      <div className="message-meta">
                        <span className={`status-badge ${msg.status}`}>
                          {msg.status === 'unread' ? 'Unread' : msg.status === 'read' ? 'Read' : 'Replied'}
                        </span>
                        <span className="message-date">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="message-body">
                      <p>{msg.message}</p>
                    </div>
                    
                    {msg.reply && (
                      <div className="message-reply">
                        <strong>Admin Reply:</strong>
                        <p>{msg.reply}</p>
                        <small>Replied on: {new Date(msg.repliedAt).toLocaleString()}</small>
                      </div>
                    )}
                    
                    <div className="message-actions">
                      {replyingTo === msg._id ? (
                        <div className="reply-form">
                          <textarea
                            placeholder="Type your reply here..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows="3"
                          />
                          <div className="reply-buttons">
                            <button onClick={() => handleReply(msg._id)} className="send-reply-btn">
                              Send Reply
                            </button>
                            <button onClick={() => { setReplyingTo(null); setReplyMessage(''); }} className="cancel-btn">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          {msg.status !== 'replied' && (
                            <button onClick={() => setReplyingTo(msg._id)} className="reply-btn">
                              Reply
                            </button>
                          )}
                          <button onClick={() => deleteMessage(msg._id)} className="delete-msg-btn">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab Content - Same as before */}
        {!loading && activeTab === 'posts' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>All Posts</h2>
              <p>Manage and remove inappropriate content</p>
            </div>
            
            {posts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No posts found</p>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                  <div key={post._id} className={`post-card-admin ${editingId === post._id ? 'editing' : ''}`}>
                    {editingId === post._id ? (
                      // Edit Form
                      <div className="post-edit-form">
                        <h3>Edit Post</h3>
                        
                        <div className="form-group">
                          <label>Title</label>
                          <input 
                            type="text" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Post title"
                          />
                        </div>

                        <div className="form-group">
                          <label>Content</label>
                          <textarea 
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            placeholder="Post content"
                            rows="6"
                          />
                        </div>

                        <div className="form-group">
                          <label>Image</label>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageChange}
                          />
                          {editImagePreview && (
                            <div className="image-preview">
                              <img src={editImagePreview} alt="Preview" />
                            </div>
                          )}
                        </div>

                        <div className="edit-actions">
                          <button 
                            onClick={() => handleSavePost(post._id)}
                            className="save-post-btn"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Post
                      <>
                        {post.image && (
                          <div className="post-image">
                            <img src={`http://localhost:5000/uploads/${post.image}`} alt={post.title} />
                          </div>
                        )}
                        <div className="post-info">
                          <h3>{post.title}</h3>
                          <p className="post-meta">
                            By {post.author?.name || 'Unknown'} • 
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                          <p className="post-excerpt">{post.body.substring(0, 100)}...</p>
                          <div className="post-status">
                            <span className={`status-badge ${post.status}`}>
                              {post.status === 'published' ? 'Published' : 'Removed'}
                            </span>
                          </div>
                        </div>
                        {post.status === 'published' && (
                          <div className="post-actions">
                            <button 
                              onClick={() => handleStartEdit(post)}
                              className="edit-btn"
                            >
                              Edit Post
                            </button>
                            <button 
                              onClick={() => handleRemovePost(post._id)}
                              className="remove-btn"
                            >
                              Remove Post
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab Content - Same as before */}
        {!loading && activeTab === 'users' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Members</h2>
              <p>Manage user accounts and permissions</p>
            </div>
            
            {users.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No members found</p>
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(member => (
                      <tr key={member._id}>
                        <td className="user-cell">
                          <div className="user-avatar">
                            {member.profilePic ? (
                              <img src={`http://localhost:5000/uploads/${member.profilePic}`} alt={member.name} />
                            ) : (
                              <div className="avatar-placeholder">{member.name?.charAt(0) || 'U'}</div>
                            )}
                          </div>
                          <span className="user-name">{member.name}</span>
                        </td>
                        <td>{member.email}</td>
                        <td>
                          <span className={`role-badge ${member.role}`}>
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${member.status}`}>
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => handleToggleUserStatus(member._id, member.status)}
                            className={`action-btn ${member.status === 'active' ? 'deactivate' : 'activate'}`}
                          >
                            {member.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;