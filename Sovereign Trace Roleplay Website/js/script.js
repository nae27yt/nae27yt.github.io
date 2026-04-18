// Get elements
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme on page load (default to dark mode)
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
    } else {
        // Default to dark mode
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
});

// Handle theme toggle click
themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // Save the current theme preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
// Navbar Toggle
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

