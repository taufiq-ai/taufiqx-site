fetch('/templates/partial/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const navLink = document.querySelector(`#navbar a[href='${currentPage}']`);
    if (navLink) {
      document.querySelectorAll('#navbar a').forEach(link => link.classList.remove('active'));
      navLink.classList.add('active');
    }
    
    // Mobile nav toggle
    document.querySelector('.mobile-nav-toggle').addEventListener('click', function() {
      document.querySelector('#navbar').classList.toggle('navbar-mobile');
      this.classList.toggle('bi-list');
      this.classList.toggle('bi-x');
    });
  });