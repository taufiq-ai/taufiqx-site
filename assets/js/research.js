// assets/js/publications.js
// Updated JSON structure needed:
// {
//   "title": "Deep Learning for Brain Tumor Detection...",
//   "authors": "Taufiq Khan Tusar, John Doe, Jane Smith",
//   "venue": "IEEE Conference on Systems and Informatics",
//   "date": "May 2023",
//   "category": "vision",
//   "abstract": "This paper presents a novel approach to brain tumor detection using convolutional neural networks...",
//   "pdf": "assets/pdf/202305_IEEE_BrainTumor.pdf",
//   "doi": "https://doi.org/10.1109/SIST58284.2023.10223507",
//   "code": "https://github.com/taufiq-ai/brain-tumor-detection" // optional
// }

// Only run on publications page
if (window.location.pathname.includes('publication') || document.title.includes('Publications')) {
  
  fetch('/data/research.json')
    .then(response => response.json())
    .then(publications => {
      const container = document.querySelector('.publications-container');
      
      if (!container) return;
      
      // Clear container
      container.innerHTML = '';
      
      // Sort publications by date (newest first)
      publications.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Generate HTML for each publication
      publications.forEach((pub, index) => {
        const publicationHtml = `
          <div class="publication-item filter-${pub.category}" data-aos="fade-up" data-aos-delay="${index * 50}">
            <div class="publication-header">
              <h3 class="publication-title">${pub.title}</h3>
            </div>
            
            <div class="publication-venue-line">
              <span class="publication-venue">${pub.venue}</span>
              <span class="publication-date">${pub.date}</span>
            </div>

            <div class="publication-authors">
              ${pub.authors}
            </div>
            
            <div class="publication-tags">
              <span class="publication-category">${pub.category.replace('filter-', '').toUpperCase()}</span>
              ${pub.tags ? `
                <span style="color: #666; font-size: 12px;">tags:</span>
                <div class="publication-tech-tags">
                  ${pub.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
              ` : ''}
            </div>
            
            ${pub.abstract ? `
              <div class="publication-abstract">
                <button class="abstract-toggle" onclick="toggleAbstract(${index})">
                  <span>Show Abstract</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="abstract-content" id="abstract-${index}">
                  ${pub.abstract}
                </div>
              </div>
            ` : ''}
            
            <div class="publication-links">
              ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" class="link-pdf">
                <i class="fas fa-file-pdf"></i> PDF
              </a>` : ''}
              
              ${pub.doi ? `<a href="${pub.doi}" target="_blank" class="link-doi">
                <i class="fas fa-external-link-alt"></i> DOI
              </a>` : ''}
              
              ${pub.dataset ? `<a href="${pub.dataset}" target="_blank" class="link-dataset">
                <i class="fas fa-database"></i> Dataset
              </a>` : ''}
              
              ${pub.code ? `<a href="${pub.code}" target="_blank" class="link-code">
                <i class="fab fa-github"></i> Code
              </a>` : ''}
            </div>
          </div>
        `;
        
        container.innerHTML += publicationHtml;
      });

      // Initialize filtering
      setTimeout(() => {
        initializeFiltering();
        
        // Refresh AOS
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, 100);

    })
    .catch(error => {
      console.error('Error loading publications:', error);
    });
}

// Toggle abstract function
function toggleAbstract(index) {
  const button = document.querySelector(`[onclick="toggleAbstract(${index})"]`);
  const content = document.getElementById(`abstract-${index}`);
  const icon = button.querySelector('i');
  const text = button.querySelector('span');
  
  if (content.classList.contains('show')) {
    content.classList.remove('show');
    button.classList.remove('expanded');
    text.textContent = 'Show Abstract';
  } else {
    content.classList.add('show');
    button.classList.add('expanded');
    text.textContent = 'Hide Abstract';
  }
}

// Initialize filtering for publications
function initializeFiltering() {
  const filterButtons = document.querySelectorAll('#portfolio-flters li');
  const publicationItems = document.querySelectorAll('.publication-item');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active filter
      filterButtons.forEach(btn => btn.classList.remove('filter-active'));
      this.classList.add('filter-active');
      
      const filterValue = this.getAttribute('data-filter');
      
      // Show/hide publications
      publicationItems.forEach(item => {
        if (filterValue === '*' || item.classList.contains(filterValue.substring(1))) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.5s ease';
        } else {
          item.style.display = 'none';
        }
      });
      
      // Refresh AOS
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    });
  });
}

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);