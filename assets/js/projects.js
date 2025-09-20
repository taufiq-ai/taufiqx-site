// Projects system with filtering
class ProjectsSystem {
  constructor() {
    this.projects = [];
    this.isotope = null;
  }

  async loadProjects() {
    try {
      const response = await fetch('/data/projects.json');
      this.projects = await response.json();
      
      // Sort projects by year (newest first)
      this.projects.sort((a, b) => parseInt(b.year) - parseInt(a.year));
      
      this.renderProjects();
      this.initializeFilters();
      
    } catch (error) {
      console.error('Error loading projects:', error);
      this.showError();
    }
  }

  renderProjects() {
    const container = document.querySelector('.projects-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="col-12 projects-loading"><i class="fas fa-spinner"></i><p>Loading projects...</p></div>';

    // Clear loading state
    container.innerHTML = '';

    // Render projects
    this.projects.forEach((project, index) => {
      const projectHtml = this.generateProjectHTML(project, index);
      container.innerHTML += projectHtml;
    });

    // Initialize Isotope for filtering
    this.initializeIsotope();

    // Refresh AOS animations
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }

  generateProjectHTML(project, index) {
    const tagsHtml = project.tags ? project.tags.map(tag => 
      `<span class="project-tag">${tag}</span>`
    ).join('') : '';

    const truncatedDescription = this.truncateDescription(project.description, 100);

    const linksHtml = this.generateLinksHTML(project);

    return `
      <div class="col-lg-4 col-md-6 project-item ${project.category}">
        <div class="project-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
          <div class="project-card-content">
            <div class="project-header">
              <div class="project-meta">
                <span class="project-year">
                  <i class="fas fa-calendar-alt"></i>
                  ${project.year}
                </span>
                <span class="project-category">
                  <i class="fas fa-folder"></i>
                  ${this.getCategoryName(project.category)}
                </span>
              </div>
            </div>

            <h3 class="project-title">${project.title}</h3>

            <p class="project-description">${truncatedDescription}</p>

            <div class="project-tools">
              <i class="fas fa-tools"></i>
              <span>${project.tools}</span>
            </div>

            ${tagsHtml ? `<div class="project-tags">${tagsHtml}</div>` : ''}

            <div class="project-links">
              ${linksHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateLinksHTML(project) {
    let linksHtml = '';

    if (project.github) {
      linksHtml += `<a href="${project.github}" target="_blank" class="project-link github" title="View Code">
        <i class="fab fa-github"></i>
      </a>`;
    }

    if (project.deployment) {
      linksHtml += `<a href="${project.deployment}" target="_blank" class="project-link live" title="Live Demo">
        <i class="fas fa-external-link-alt"></i>
      </a>`;
    }

    if (project.demo) {
      linksHtml += `<a href="${project.demo}" target="_blank" class="project-link demo" title="Video Demo">
        <i class="fas fa-play"></i>
      </a>`;
    }

    return linksHtml;
  }

  truncateDescription(description, maxLength) {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength).trim() + '...';
  }

  getCategoryName(category) {
    const categoryNames = {
      'web': 'Web App',
      'ml': 'Machine Learning',
      'api': 'API',
      'data': 'Data Science',
      'mobile': 'Mobile App'
    };
    return categoryNames[category] || category;
  }

  initializeIsotope() {
    const container = document.querySelector('.projects-container');
    if (!container) return;

    // Initialize Isotope
    this.isotope = new Isotope(container, {
      itemSelector: '.project-item',
      layoutMode: 'fitRows'
    });
  }

  initializeFilters() {
    const filters = document.querySelectorAll('#projects-filters li');
    
    filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all filters
        filters.forEach(f => f.classList.remove('filter-active'));
        
        // Add active class to clicked filter
        filter.classList.add('filter-active');
        
        // Get filter value
        const filterValue = filter.getAttribute('data-filter');
        
        // Apply filter
        if (this.isotope) {
          this.isotope.arrange({ filter: filterValue });
        }
      });
    });
  }

  showError() {
    const container = document.querySelector('.projects-container');
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center">
            <h4>Unable to load projects</h4>
            <p>Please try refreshing the page. If the problem persists, check back later.</p>
          </div>
        </div>
      `;
    }
  }
}

// Global projects instance
const projects = new ProjectsSystem();

// Initialize projects when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.projects-container')) {
    projects.loadProjects();
  }
});