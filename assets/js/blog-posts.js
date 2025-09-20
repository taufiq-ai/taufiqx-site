// Blog Post System
class BlogPostSystem {
  constructor() {
    this.posts = [];
    this.currentPost = null;
    this.postSlug = this.getPostSlugFromURL();
  }

  async init() {
    try {
      // Load all posts metadata
      await this.loadPostsMetadata();
      
      // Find and load the current post
      if (this.postSlug) {
        await this.loadPost(this.postSlug);
      } else {
        this.showError('No post specified');
      }
    } catch (error) {
      console.error('Error initializing blog post:', error);
      this.showError('Failed to load blog post');
    }
  }

  async loadPostsMetadata() {
    const response = await fetch('/data/blog.json');
    this.posts = await response.json();
    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getPostSlugFromURL() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop();
    return fileName.replace('.html', '');
  }

  async loadPost(slug) {
    // Find post metadata
    this.currentPost = this.posts.find(post => 
      this.generateSlug(post.title) === slug || post.slug === slug
    );

    if (!this.currentPost) {
      this.showError('Post not found');
      return;
    }

    try {
      // Load markdown content
      const markdownPath = `posts/${slug}.md`;
      const response = await fetch(markdownPath);
      
      if (!response.ok) {
        throw new Error('Markdown file not found');
      }

      const markdownContent = await response.text();
      
      // Parse frontmatter and content
      const parsed = this.parseFrontmatter(markdownContent);
      
      // Merge frontmatter with metadata
      this.currentPost = { ...this.currentPost, ...parsed.frontmatter };
      
      // Render the post
      this.renderPost(parsed.content);
      
    } catch (error) {
      console.error('Error loading post content:', error);
      // Fallback to metadata only
      this.renderPostFromMetadata();
    }
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, content: content };
    }

    const frontmatter = {};
    const frontmatterText = match[1];
    const markdownContent = match[2];

    // Simple YAML parsing (basic key: value pairs)
    frontmatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        let value = valueParts.join(':').trim();
        
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
        } else {
          // Remove quotes
          value = value.replace(/^["']|["']$/g, '');
        }
        
        frontmatter[key.trim()] = value;
      }
    });

    return { frontmatter, content: markdownContent };
  }

  renderPost(markdownContent) {
    // Hide loading, show content
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('article-content').style.display = 'block';

    // Set meta tags
    this.updateMetaTags();

    // Render header
    this.renderPostHeader();

    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent, {
      breaks: true,
      gfm: true
    });

    // Render content
    document.getElementById('article-body').innerHTML = htmlContent;

    // Apply syntax highlighting
    Prism.highlightAll();

    // Render navigation and sidebar
    this.renderPostNavigation();
    this.renderRecentPosts();
    this.setupGitHubDiscussion();

    // Refresh AOS animations
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }

  renderPostFromMetadata() {
    // Fallback rendering when markdown file is not available
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('article-content').style.display = 'block';

    this.updateMetaTags();
    this.renderPostHeader();

    document.getElementById('article-body').innerHTML = `
      <div class="alert alert-info">
        <h4>Content Preview</h4>
        <p>${this.currentPost.description}</p>
        <p><em>Full article content is being prepared. Please check back soon!</em></p>
      </div>
    `;

    this.renderPostNavigation();
    this.renderRecentPosts();
  }

  updateMetaTags() {
    document.getElementById('post-title').textContent = `${this.currentPost.title} - Taufiq`;
    document.getElementById('post-description').setAttribute('content', this.currentPost.description);
    document.getElementById('post-keywords').setAttribute('content', 
      this.currentPost.tags ? this.currentPost.tags.join(', ') : ''
    );
    document.title = `${this.currentPost.title} - Taufiq`;
  }

  renderPostHeader() {
    document.getElementById('article-title').textContent = this.currentPost.title;
    document.getElementById('article-date').textContent = this.formatDate(this.currentPost.date);
    document.getElementById('article-read-time').textContent = this.currentPost.readTime || '5 min read';

    // Render tags
    const tagsContainer = document.getElementById('article-tags');
    if (this.currentPost.tags && this.currentPost.tags.length > 0) {
      tagsContainer.innerHTML = this.currentPost.tags.map(tag => 
        `<a href="/blog/posts" class="post-tag">${tag}</a>`
      ).join('');
    }
  }

  renderPostNavigation() {
    const currentIndex = this.posts.findIndex(post => 
      this.generateSlug(post.title) === this.postSlug || post.slug === this.postSlug
    );

    // Previous post (newer)
    if (currentIndex > 0) {
      const prevPost = this.posts[currentIndex - 1];
      const prevSlug = prevPost.slug || this.generateSlug(prevPost.title);
      
      const prevNav = document.getElementById('nav-previous');
      prevNav.style.display = 'block';
      prevNav.innerHTML = `
        <a href="${prevSlug}.html">
          <i class="fas fa-chevron-left"></i>
          <div>
            <small>Previous Post</small>
            <span class="nav-title">${prevPost.title}</span>
          </div>
        </a>
      `;
    }

    // Next post (older)
    if (currentIndex < this.posts.length - 1) {
      const nextPost = this.posts[currentIndex + 1];
      const nextSlug = nextPost.slug || this.generateSlug(nextPost.title);
      
      const nextNav = document.getElementById('nav-next');
      nextNav.style.display = 'block';
      nextNav.innerHTML = `
        <a href="${nextSlug}.html">
          <div>
            <small>Next Post</small>
            <span class="nav-title">${nextPost.title}</span>
          </div>
          <i class="fas fa-chevron-right"></i>
        </a>
      `;
    }
  }

  renderRecentPosts() {
    const recentPosts = this.posts
      .filter(post => post.title !== this.currentPost.title)
      .slice(0, 4);

    const container = document.getElementById('recent-posts');
    container.innerHTML = recentPosts.map(post => {
      const slug = post.slug || this.generateSlug(post.title);
      return `
        <a href="${slug}.html" class="recent-post">
          <div class="recent-post-title">${post.title}</div>
          <div class="recent-post-date">${this.formatDate(post.date)}</div>
        </a>
      `;
    }).join('');
  }

  setupGitHubDiscussion() {
    // Generate GitHub discussion link based on post title
    const discussionTitle = encodeURIComponent(`Discussion: ${this.currentPost.title}`);
    const discussionBody = encodeURIComponent(`Let's discuss the blog post: ${this.currentPost.title}\n\nRead the full post: ${window.location.href}`);
    const githubUrl = `https://github.com/taufiq-ai/portfolio/discussions/new?category=blog&title=${discussionTitle}&body=${discussionBody}`;
    
    document.getElementById('github-discussion-link').setAttribute('href', githubUrl);
  }

  generateSlug(title) {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  showError(message) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
  }
}

// Initialize blog post system when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('blog-post')) {
    const blogPost = new BlogPostSystem();
    blogPost.init();
  }
});