// frontend/src/pages/EditPostPage.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function EditPostPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  const PF = "http://localhost:5000/uploads/";

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await API.get(`/posts/${id}`);
        setTitle(data.title);
        setBody(data.body);
        if (data.image) {
          setImagePreview(`${PF}${data.image}`);
        }
      } catch (err) {
        setError('Failed to load post for editing');
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(''); // Clear error on new selection
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim()) {
      setError('Content is required');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    // FormData para sa file uploads
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('body', body.trim());
    if (image) {
      fd.append('image', image);
    }

    try {
      const { data } = await API.put(`/posts/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Post updated successfully!');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/posts/${data._id}`);
      }, 1500);

    } catch (err) {
      console.error('Update post error:', err);
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading post... ⏳</div>;
  }

  return (
    <div className="edit-post-page">
      <h2>Edit Post</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Make changes to your post
      </p>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type='text'
            placeholder='Give your post a catchy title...'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="body">Content *</label>
          <textarea
            id="body"
            placeholder='Write your story or thoughts here...'
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={10}
            required
          />
        </div>

        <div className="upload-section">
          <label>Cover Image (Optional)</label>
          <input
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            id="image-upload"
          />
          <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>
            Max size: 5MB. Supported formats: JPG, PNG, GIF, WEBP
          </small>

          {imagePreview && (
            <div style={{ marginTop: '15px' }}>
              <img src={imagePreview} alt="Preview" style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '10px'
              }} />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                style={{
                  background: '#ff4d4d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button type='submit' disabled={loading}>
          {loading ? 'Updating...' : '💾 Update Post'}
        </button>
      </form>
    </div>
  );
}

export default EditPostPage;
