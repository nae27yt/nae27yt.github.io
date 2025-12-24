// Get elements
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
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
/*