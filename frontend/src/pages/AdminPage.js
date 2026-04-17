// frontend/src/pages/AdminPage.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
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

  // ✅ Use environment variable for image base URL
  const imageBaseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'messages') fetchMessages();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/posts');
      setPosts(data);
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/messages');
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const handleReply = async (id) => {
    if (!replyMessage.trim()) return;
    try {
      await API.put(`/messages/${id}/reply`, { reply: replyMessage });
      setSuccess('Reply sent!');
      setReplyingTo(null);
      setReplyMessage('');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send reply');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await API.delete(`/messages/${id}`);
      setSuccess('Message deleted');
      fetchMessages();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleRemovePost = async (id) => {
    if (!window.confirm('Remove this post?')) return;
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setSuccess('Post removed');
      fetchPosts();
    } catch (err) {
      setError('Failed to remove post');
    }
  };

  const handleStartEdit = (post) => {
    setEditingId(post._id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditImage(null);
    setEditImagePreview(post.image ? `${imageBaseUrl}/uploads/${post.image}` : null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePost = async (id) => {
    if (!editTitle.trim() || !editBody.trim()) {
      setError('Title and body required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('body', editBody);
      if (editImage) formData.append('image', editImage);

      // ⚠️ Make sure your backend has this route or adjust accordingly
      await API.put(`/admin/posts/${id}/edit`, formData);
      setSuccess('Post updated');
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditBody('');
    setEditImage(null);
    setEditImagePreview('');
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`${action} this user?`)) return;
    try {
      await API.put(`/admin/users/${id}/status`);
      setSuccess(`User ${action}d`);
      fetchUsers();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}</p>
          {unreadCount > 0 && <div className="unread-badge">📬 {unreadCount} new</div>}
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>📬 Messages {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}</button>
          <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>📝 Posts ({posts.length})</button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Members ({users.length})</button>
        </div>

        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {loading && <div className="admin-loading">Loading...</div>}

        {!loading && activeTab === 'messages' && (
          <div className="admin-content">
            <h2>Messages</h2>
            {messages.length === 0 ? <div className="empty-state">No messages</div> : (
              messages.map(msg => (
                <div key={msg._id} className={`message-card ${msg.status}`} onClick={() => msg.status === 'unread' && markAsRead(msg._id)}>
                  <div className="message-header">
                    <div><strong>{msg.senderName}</strong> ({msg.senderEmail})</div>
                    <span className={`status-badge ${msg.status}`}>{msg.status}</span>
                  </div>
                  <div><small>{new Date(msg.createdAt).toLocaleString()}</small></div>
                  <div className="message-body">{msg.message}</div>
                  {msg.reply && <div className="message-reply"><strong>Reply:</strong> {msg.reply}</div>}
                  <div className="message-actions">
                    {replyingTo === msg._id ? (
                      <div className="reply-form">
                        <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows="2" placeholder="Type reply..." />
                        <button onClick={() => handleReply(msg._id)}>Send</button>
                        <button onClick={() => { setReplyingTo(null); setReplyMessage(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        {msg.status !== 'replied' && <button onClick={() => setReplyingTo(msg._id)}>Reply</button>}
                        <button onClick={() => deleteMessage(msg._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'posts' && (
          <div className="admin-content">
            <h2>All Posts</h2>
            {posts.length === 0 ? <div className="empty-state">No posts</div> : (
              posts.map(post => (
                <div key={post._id} className="post-card-admin">
                  {editingId === post._id ? (
                    <div className="post-edit-form">
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
                      <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows="5" />
                      <input type="file" accept="image/*" onChange={handleEditImageChange} />
                      {editImagePreview && <img src={editImagePreview} alt="preview" style={{maxWidth: '100px'}} />}
                      <button onClick={() => handleSavePost(post._id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      {post.image && <img src={`${imageBaseUrl}/uploads/${post.image}`} alt={post.title} style={{maxWidth: '100px'}} />}
                      <h3>{post.title}</h3>
                      <p>By {post.author?.name} on {new Date(post.createdAt).toLocaleDateString()}</p>
                      <p>{post.body.substring(0, 100)}...</p>
                      <span className={`status-badge ${post.status}`}>{post.status}</span>
                      <button onClick={() => handleStartEdit(post)}>Edit</button>
                      <button onClick={() => handleRemovePost(post._id)}>Remove</button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="admin-content">
            <h2>Members</h2>
            {users.length === 0 ? <div className="empty-state">No members</div> : (
              <table className="users-table">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                      <td><button onClick={() => handleToggleUserStatus(u._id, u.status)}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;