// assets/js/publications.js (simplified version)
fetch('assets/data/research.json')
  .then(response => response.json())
  .then(publications => {
    const container = document.querySelector('.portfolio-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    publications.forEach(pub => {
      container.innerHTML += `
        <div class="col-lg-4 col-md-6 portfolio-item filter-${pub.category}">
          <div class="portfolio-wrap">
            <img src="${pub.image}" class="img-fluid" alt="">
            <div class="portfolio-info">
              <p>${pub.journal} - ${pub.date}</p>
              <div class="portfolio-links">
                <a href="${pub.pdf}" target="_blank" title="View PDF"><i class="fa fa-file-pdf"></i></a>
                <a href="${pub.doi}" target="_blank" title="DOI"><img src="assets/img/publications/doi.png" width="20" height="20" alt="doi"></a>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    // The main.js MutationObserver will detect this and initialize isotope automatically
  })
  .catch(error => console.error('Error loading publications:', error));