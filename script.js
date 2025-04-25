// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Progress Circle Animation
const progressBar = document.querySelector('.progress-bar');
const percentage = document.querySelector('.percentage');
const currentAmount = 0;
const targetAmount = 100000;

function updateProgress() {
    const progress = (currentAmount / targetAmount) * 100;
    const angle = (progress / 100) * 360;
    
    progressBar.style.background = `conic-gradient(var(--primary-color) ${angle}deg, transparent ${angle}deg)`;
    percentage.textContent = `${Math.round(progress)}%`;
}

// Animate progress on scroll
const progressSection = document.querySelector('.progress');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            updateProgress();
        }
    });
}, { threshold: 0.5 });

observer.observe(progressSection);

// Form Submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', data);
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Backer Tier Selection
document.querySelectorAll('.select-button').forEach(button => {
    button.addEventListener('click', () => {
        const tier = button.closest('.tier');
        const title = tier.querySelector('h3').textContent;
        const price = tier.querySelector('.price').textContent;
        
        // Here you would typically redirect to a payment page
        alert(`You selected the ${title} tier for ${price}`);
    });
});

// Scroll Animation
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}); 