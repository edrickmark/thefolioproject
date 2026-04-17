// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

function HomePage() {
  const [posts, setPosts] = useState([]);
  
  // ✅ Use environment variable for image base URL (no hardcoded localhost)
  const imageBaseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Fetch all posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get('/posts');
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <main>
      <section className="hero">
        <h1>The Purr</h1>
        <p>It isn't merely a sound—it’s a low-frequency engine of contentment, a biological hum that suggests the cat is vibrating at a different frequency than the rest of the world.</p><br />
        <img src="/photos/c1.jpg" width="350" height="350" alt="Cead" />
      </section>

      <section className="preview-grid">
        <div className="card one">
          <h3>The Liquid Shadow</h3>
          <p>A cat is a drop of midnight that refuses to be contained by a bowl, a box, or a closed door. They are the only solid matter that behaves like a spill.</p><br />
          <img src="/photos/c2.jpg" width="250" height="250" alt="Bloom" />
        </div>
        <div className="card one">
          <h3>The Living Paradox</h3>
          <p>They are velvet gloves hiding needlework, a masterpiece of contradictions where the softest touch always carries the memory of the hunt.</p><br />
          <img src="/photos/c3.jpg" width="250" height="250" alt="Gardener" />
        </div>
        <div className="card one">
          <h3>The Fur-Bound Battery</h3>
          <p>The purr is a rechargeable soul, a low-voltage vibration that mends the frayed edges of a human’s long day.</p><br />
          <img src="/photos/c4.jpg" width="250" height="250" alt="Horizon" />
        </div>
      </section>

      {/* Dynamic posts section */}
      <section className="post-section">
        <h2 className="section-title">Whispers & Purrs</h2>
        <div className="post-grid-modern">
          {posts.map((post) => (
            <article key={post._id} className="post-card-new">
              {post.image && (
                <div className="post-image-wrapper">
                  <img src={`${imageBaseUrl}/uploads/${post.image}`} alt={post.title} />
                </div>
              )}
              <div className="post-content">
                <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                <h3>{post.title}</h3>
                <p>{post.body.substring(0, 90)}...</p>
                <Link to={`/posts/${post._id}`} className="read-more-btn">
                  Read Full Story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>&copy; MiIlao. All rights reserved. | Contact: @gmail.com</p>
      </footer>
    </main>
  );
}

export default HomePage;