// frontend/src/pages/PostPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Use environment variable for image base URL (no hardcoded localhost)
  const imageBaseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Fetch post and comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const { data: postData } = await API.get(`/posts/${id}`);
        setPost(postData);

        // Fetch comments for this post
        const { data: commentsData } = await API.get(`/comments/${id}`);
        setComments(commentsData);
      } catch (err) {
        setError('Post not found 😅');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      // ✅ Correct endpoint and request body
      const { data: newComment } = await API.post(`/comments/${id}`, { body: commentText });
      // Add new comment to the list (optimistic update)
      setComments(prev => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      alert("Failed to post comment. Check your connection.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading post... ⏳</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>{error}</div>;
  if (!post) return null;

  return (
    <div className="post-detail-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px', marginTop: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
      
      {/* Admin action button */}
      {user && user.role === 'admin' && (
        <button 
          onClick={async () => {
            if(window.confirm("Remove this post?")) {
              try {
                await API.put(`/admin/posts/${id}/remove`);
                alert("Post removed!");
                window.history.back();
              } catch(err) { alert("Error removing post"); }
            }
          }}
          style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
        >
          🗑️ Remove Post (Admin)
        </button>
      )}

      {/* Image section – fixed URL */}
      {post.image && (
        <img 
          src={`${imageBaseUrl}/uploads/${post.image}`}
          alt={post.title} 
          style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '15px', marginBottom: '1.5rem' }} 
        />
      )}
      
      <h1>{post.title}</h1>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>
        Published on: {new Date(post.createdAt).toLocaleDateString()}
      </p>
      
      <div className="post-body" style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '1.5rem', whiteSpace: 'pre-wrap', color: '#444' }}>
        {post.body}
      </div>

      <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

      {/* Comments section */}
      <section className="comments-section">
        <h3 style={{ marginBottom: '20px' }}>Comments ({comments.length})</h3>

        <div className="comments-list" style={{ marginBottom: '30px' }}>
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c._id} style={{ background: '#f9f9f9', padding: '12px 15px', borderRadius: '10px', marginBottom: '10px', borderLeft: '4px solid #ff69b4' }}>
                <span style={{ fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>
                  {c.author?.name || 'Unknown'}
                </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#333' }}>{c.body}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>No comments yet. Be the first to purr! 🐾</p>
          )}
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea 
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'inherit' }}
              required
            />
            <button 
              type="submit" 
              disabled={submitting}
              style={{ alignSelf: 'flex-end', padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: '#fff0f5', borderRadius: '10px', border: '1px dashed #ffb6c1' }}>
            <p style={{ margin: 0 }}>
              Want to join the conversation? <Link to="/login" style={{ color: '#ff1493', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link> to post a comment. 😺
            </p>
          </div>
        )}
      </section>

      <button 
        onClick={() => window.history.back()} 
        style={{ marginTop: '40px', background: 'none', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
      >
        ⬅️ Back to Home
      </button>
    </div>
  );
}

export default PostPage;