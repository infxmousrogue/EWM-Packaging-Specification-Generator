document.addEventListener('DOMContentLoaded', function () {
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Check and apply saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '🌜';
    } else {
        themeIcon.textContent = '🌞';
    }

    // Toggle dark mode on button click
    themeToggleButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        
        // Update the icon based on the mode
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.textContent = '🌜';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = '🌞';
            localStorage.setItem('theme', 'light');
        }
    });
});

document.getElementById('download-example').addEventListener('click', function() {
    window.location.href = '/Examples/template.csv'; // Replace with your actual file path
});

document.getElementById('download-material').addEventListener('click', function() {
    window.location.href = '/Examples/materials.csv'; // Replace with your actual file path
});
