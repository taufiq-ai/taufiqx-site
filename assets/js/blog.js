// Blog system with pagination
class BlogSystem {
  constructor() {
    this.posts = [];
    this.currentPage = 1;
    this.postsPerPage = 9;
    this.totalPages = 0;
  }

  async loadBlogPosts() {
    try {
      const response = await fetch('/data/blog.json');
      this.posts = await response.json();
      
      // Sort posts by date (newest first)
      this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
      this.renderCurrentPage();
      this.renderPagination();
      
    } catch (error) {
      console.error('Error loading blog posts:', error);
      this.showError();
    }
  }

  renderCurrentPage() {
    const container = document.querySelector('.blog-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="col-12 blog-loading"><i class="fas fa-spinner"></i><p>Loading posts...</p></div>';

    // Calculate posts for current page
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    const currentPosts = this.posts.slice(startIndex, endIndex);

    // Clear loading state
    container.innerHTML = '';

    // Render posts
    currentPosts.forEach((post, index) => {
      const postHtml = this.generatePostHTML(post, startIndex + index);
      container.innerHTML += postHtml;
    });

    // Refresh AOS animations
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }

  generatePostHTML(post, index) {
    const slug = this.generateSlug(post.title);
    const tagsHtml = post.tags ? post.tags.map(tag => 
      `<a href="#" class="blog-tag" onclick="filterByTag('${tag}')">${tag}</a>`
    ).join('') : '';

    return `
      <div class="col-lg-4 col-md-6">
        <article class="blog-item" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
          <div class="blog-item-content">
            <div class="blog-item-meta">
              <span class="blog-date">
                <i class="fas fa-calendar-alt"></i>
                ${this.formatDate(post.date)}
              </span>
              <span class="blog-read-time">
                <i class="fas fa-clock"></i>
                ${post.readTime || '5 min read'}
              </span>
            </div>

            <h3 class="blog-title">
              <a href="${slug}.html">${post.title}</a>
            </h3>

            <p class="blog-description">
              ${post.description || post.excerpt || 'Click to read more about this topic...'}
            </p>

            ${tagsHtml ? `<div class="blog-tags">${tagsHtml}</div>` : ''}

            <a href="${slug}.html" class="blog-read-more">
              Read More <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </article>
      </div>
    `;
  }

  renderPagination() {
    const container = document.getElementById('blog-pagination');
    if (!container || this.totalPages <= 1) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    let paginationHtml = '';

    // Previous button
    if (this.currentPage > 1) {
      paginationHtml += `<a href="#" onclick="blog.goToPage(${this.currentPage - 1})" class="prev">
        <i class="fas fa-chevron-left"></i> Previous
      </a>`;
    }

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (startPage > 1) {
      paginationHtml += `<a href="#" onclick="blog.goToPage(1)">1</a>`;
      if (startPage > 2) {
        paginationHtml += `<span>...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i === this.currentPage) {
        paginationHtml += `<span class="current">${i}</span>`;
      } else {
        paginationHtml += `<a href="#" onclick="blog.goToPage(${i})">${i}</a>`;
      }
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        paginationHtml += `<span>...</span>`;
      }
      paginationHtml += `<a href="#" onclick="blog.goToPage(${this.totalPages})">${this.totalPages}</a>`;
    }

    // Next button
    if (this.currentPage < this.totalPages) {
      paginationHtml += `<a href="#" onclick="blog.goToPage(${this.currentPage + 1})" class="next">
        Next <i class="fas fa-chevron-right"></i>
      </a>`;
    }

    container.innerHTML = paginationHtml;
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.renderCurrentPage();
      this.renderPagination();
      
      // Scroll to top of blog section
      document.getElementById('blog').scrollIntoView({ behavior: 'smooth' });
    }
  }

  generateSlug(title) {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  showError() {
    const container = document.querySelector('.blog-container');
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center">
            <h4>Unable to load blog posts</h4>
            <p>Please try refreshing the page. If the problem persists, check back later.</p>
          </div>
        </div>
      `;
    }
  }
}

// Global blog instance
const blog = new BlogSystem();

// Filter by tag function
function filterByTag(tag) {
  // For now, just log the tag. Later we can implement actual filtering
  console.log(`Filtering by tag: ${tag}`);
  // TODO: Implement tag filtering functionality
}

// Initialize blog when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.blog-container')) {
    blog.loadBlogPosts();
  }
});