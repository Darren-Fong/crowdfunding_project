// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
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

// Custom Alert System
const customAlert = {
    alert: null,
    title: null,
    message: null,
    input: null,
    confirmButton: null,
    cancelButton: null,
    resolve: null,

    init() {
        this.alert = document.getElementById('customAlert');
        this.title = this.alert.querySelector('.alert-title');
        this.message = this.alert.querySelector('.alert-message');
        this.input = this.alert.querySelector('.alert-input');
        this.confirmButton = this.alert.querySelector('.alert-button.confirm');
        this.cancelButton = this.alert.querySelector('.alert-button.cancel');

        this.confirmButton.addEventListener('click', () => {
            const value = this.input.value.trim();
            this.hide(true, value);
        });
        this.cancelButton.addEventListener('click', () => this.hide(false));
    },

    show: function(title, message, input = false) {
        this.title.textContent = title;
        this.message.textContent = message;
        this.input.style.display = input ? 'block' : 'none';
        this.input.value = ''; // Clear input field
        this.alert.classList.add('active');
        if (input) {
            this.input.focus();
        }
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    },

    hide: function(confirmed, value = '') {
        this.alert.classList.remove('active');
        if (this.resolve) {
            this.resolve(confirmed ? value : false);
            this.resolve = null;
        }
    }
};

// Initialize custom alert
document.addEventListener('DOMContentLoaded', () => {
    customAlert.init();
});

// Progress Bar Animation
let totalPledged = 0;
const targetAmount = 100000; // Updated to HK$100,000
const stretchGoals = [
    { amount: 35000, title: "Stretch Goal 1", description: "AI Speaker Integration" },
    { amount: 65000, title: "Stretch Goal 2", description: "Security Features" }
];

// Function to get progress from database
async function getProgress() {
    try {
        const response = await fetch('/api/progress');
        const data = await response.json();
        
        if (data && typeof data.currentAmount === 'number') {
            totalPledged = data.currentAmount;
            localStorage.setItem('totalPledged', totalPledged);
            
            if (data.backers) {
                updateBackersList(data.backers);
            }
            
            // Update progress and stretch goals
            updateProgress();
            checkStretchGoals();
            updateStretchGoalsVisibility();
        }
    } catch (error) {
        console.error('Error fetching progress:', error);
        const localProgress = localStorage.getItem('totalPledged');
        
        if (localProgress) {
            totalPledged = parseInt(localProgress);
            updateProgress();
            checkStretchGoals();
            updateStretchGoalsVisibility();
        }
    }
}

async function updateDatabase(amount, backer) {
    try {
        console.log('Sending pledge update:', { amount, backer });
        
        const response = await fetch('/api/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                amount: amount,
                backer: backer
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Server response data:', data);
        
        if (!data || typeof data.currentAmount !== 'number') {
            throw new Error('Invalid server response format');
        }

        totalPledged = data.currentAmount;
        localStorage.setItem('totalPledged', totalPledged);
        
        if (data.backers) {
            updateBackersList(data.backers);
        }
        
        updateProgress();
        return data;
    } catch (error) {
        console.error('Error updating database:', error);
        throw new Error('Failed to process your pledge. Please try again later.');
    }
}

// Function to position stretch markers
function positionStretchMarkers() {
    const progressBar = document.querySelector('.progress-bar-container');
    const stretchGoals = document.querySelectorAll('.stretch-goal');
    const targetAmount = 100000; // Total funding target

    stretchGoals.forEach(goal => {
        const goalAmount = parseInt(goal.dataset.goal);
        const position = (goalAmount / targetAmount) * 100;
        goal.style.left = `${position}%`;
    });
}

// Function to check and update stretch goal achievements
function checkStretchGoals() {
    const progress = parseFloat(document.querySelector('.progress-percentage').textContent.replace('%', ''));
    const stretchGoals = document.querySelectorAll('.stretch-goal-card');
    
    stretchGoals.forEach(goal => {
        const goalAmount = parseFloat(goal.dataset.amount);
        const progressBar = goal.querySelector('.stretch-progress-bar');
        
        if (progress >= goalAmount) {
            goal.classList.add('achieved');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        } else {
            goal.classList.remove('achieved');
            if (progressBar) {
                const progressPercent = (progress / goalAmount) * 100;
                progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
            }
        }
    });
}

// Function to update stretch goals visibility
function updateStretchGoalsVisibility() {
    const stretchGoalsInfo = document.querySelector('.stretch-goals-info');
    if (!stretchGoalsInfo) return;

    const stretchGoalCards = document.querySelectorAll('.stretch-goal-card');
    const currentAmount = totalPledged;

    stretchGoalCards.forEach(card => {
        const goalText = card.querySelector('h3').textContent;
        const goalAmount = parseInt(goalText.match(/HK\$(\d+)/)[1]);
        const progress = (currentAmount / goalAmount) * 100;
        const progressBar = card.querySelector('.stretch-progress-bar');
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }

        // Only mark as achieved if we've actually reached the goal amount
        if (currentAmount >= goalAmount) {
            card.classList.add('achieved');
            card.querySelector('.stretch-goal-header i').style.color = '#4CAF50';
            card.querySelector('.stretch-progress-bar').style.background = '#4CAF50';
        } else {
            card.classList.remove('achieved');
            card.querySelector('.stretch-goal-header i').style.color = '';
            card.querySelector('.stretch-progress-bar').style.background = '';
        }
    });
}

// Update progress and stretch goals visibility
function updateProgress() {
    const progress = (totalPledged / targetAmount) * 100;
    const progressBars = document.querySelectorAll('.progress-bar');
    const progressAmounts = document.querySelectorAll('.progress-amount');
    const progressPercentages = document.querySelectorAll('.progress-percentage');
    
    progressBars.forEach(bar => {
        bar.style.width = `${Math.min(progress, 100)}%`;
    });
    
    progressAmounts.forEach(amount => {
        amount.textContent = `HK$${totalPledged.toLocaleString()} raised of HK$${targetAmount.toLocaleString()}`;
    });

    progressPercentages.forEach(percentage => {
        percentage.textContent = `${Math.round(Math.min(progress, 100))}%`;
    });

    checkStretchGoals();
    updateStretchGoalsVisibility();
}

// Initialize progress bars if they exist
if (document.querySelector('.progress-bar-container')) {
    // Get initial progress and backers
    getProgress().then(() => {
        // Position stretch markers
        positionStretchMarkers();
        
        // Force a reflow to ensure the transition works
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            bar.offsetHeight; // Force reflow
        });
        updateProgress();
    });

    // Handle tier selection
    document.querySelectorAll('.select-button').forEach(button => {
        button.addEventListener('click', async function() {
            const tier = this.closest('.tier');
            const price = tier.querySelector('.price').textContent;
            const amount = parseInt(price.replace(/[^0-9]/g, ''));

            try {
                const backerName = await customAlert.show(
                    'Enter Your Name',
                    'Please enter your name (optional):',
                    true
                );

                if (backerName === false) return; // User cancelled

                const backer = backerName ? { name: backerName } : { anonymous: true };

                // Disable button during update
                this.disabled = true;
                this.textContent = 'Processing...';

                // Update database
                await updateDatabase(amount, backer);
                
                // Show success message
                await customAlert.show(
                    'Thank You!',
                    `Thank you for your pledge of HK$${amount.toLocaleString()}!`,
                    false
                );

            } catch (error) {
                console.error('Error processing pledge:', error);
                await customAlert.show(
                    'Error',
                    error.message || 'There was an error processing your pledge. Please try again.',
                    false
                );
            } finally {
                // Re-enable button
                this.disabled = false;
                this.textContent = 'Select Tier';
            }
        });
    });

    // Update every 30 seconds
    setInterval(getProgress, 30000);
}

// Also update stretch goals on the products page
if (document.querySelector('.stretch-goals-info')) {
    getProgress().then(() => {
        updateStretchGoalsVisibility();
    });
}

// Scroll Animation
const sections = document.querySelectorAll('section');
const scrollNavLinks = document.querySelectorAll('.nav-links a');

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

// Navigation Active State
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Get current page from URL
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Set active class on current page link
    function setActiveLink() {
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPage === linkPath || 
                (currentPage === '' && linkPath === 'index.html') ||
                (currentPage === 'index.html' && linkPath === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Set active link on page load
    setActiveLink();
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        setActiveLink();
    });
});

// Function to update backers list
function updateBackersList(backers) {
    const backersList = document.querySelector('.backers-list');
    if (!backersList) return;

    backersList.innerHTML = ''; // Clear existing backers

    backers.forEach(backer => {
        const backerItem = document.createElement('div');
        backerItem.className = 'backer-item';
        
        if (backer.anonymous) {
            backerItem.innerHTML = '<span class="anonymous">Anonymous Backer</span>';
        } else {
            backerItem.innerHTML = `<span class="name">${backer.name}</span>`;
        }
        
        backersList.appendChild(backerItem);
    });
}

// Function to handle stretch goal interactions
function setupStretchGoals() {
    const stretchGoals = document.querySelectorAll('.stretch-goal-card');
    stretchGoals.forEach(goal => {
        if (!goal.querySelector('.stretch-progress-container')) {
            const progressBar = document.createElement('div');
            progressBar.className = 'stretch-progress-container';
            progressBar.innerHTML = '<div class="stretch-progress-bar"></div>';
            goal.appendChild(progressBar);
        }
    });
}

// Initialize stretch goals on page load
document.addEventListener('DOMContentLoaded', () => {
    setupStretchGoals();
    
    // Re-initialize on window resize
    window.addEventListener('resize', setupStretchGoals);
});

function selectTier(tierName, amount) {
    const alert = document.getElementById('customAlert');
    const title = alert.querySelector('.alert-title');
    const message = alert.querySelector('.alert-message');
    const input = alert.querySelector('.alert-input');
    const footer = alert.querySelector('.alert-footer');
    
    // Reset alert to initial state
    title.textContent = `Select ${tierName} Tier`;
    message.textContent = `You are about to pledge HK$${amount} for the ${tierName} tier. Enter your name (optional):`;
    input.value = '';
    input.placeholder = 'Anonymous if left blank';
    input.style.display = 'block';
    footer.innerHTML = `
        <button class="alert-button cancel">Cancel</button>
        <button class="alert-button confirm">Confirm</button>
    `;
    
    alert.classList.add('active');
    
    // Handle confirm button
    const confirmBtn = alert.querySelector('.alert-button.confirm');
    confirmBtn.onclick = async function() {
        const backerName = input.value.trim();
        const backer = backerName ? { name: backerName } : { anonymous: true };
        
        try {
            // Update database
            await updateDatabase(amount, backer);
            
            // Show success message with single OK button
            const successAlert = document.getElementById('customAlert');
            const successTitle = successAlert.querySelector('.alert-title');
            const successMessage = successAlert.querySelector('.alert-message');
            const successInput = successAlert.querySelector('.alert-input');
            const successFooter = successAlert.querySelector('.alert-footer');
            
            successTitle.textContent = 'Thank You!';
            successMessage.textContent = `Thank you for your pledge of HK$${amount.toLocaleString()}!`;
            successInput.style.display = 'none';
            successFooter.innerHTML = '<button class="alert-button confirm">OK</button>';
            
            // Handle OK button
            successAlert.querySelector('.alert-button.confirm').onclick = function() {
                successAlert.classList.remove('active');
            };
            
            alert.classList.remove('active');
            successAlert.classList.add('active');
        } catch (error) {
            console.error('Error processing pledge:', error);
            const errorAlert = document.getElementById('customAlert');
            const errorTitle = errorAlert.querySelector('.alert-title');
            const errorMessage = errorAlert.querySelector('.alert-message');
            const errorInput = errorAlert.querySelector('.alert-input');
            const errorFooter = errorAlert.querySelector('.alert-footer');
            
            errorTitle.textContent = 'Error';
            errorMessage.textContent = error.message || 'There was an error processing your pledge. Please try again.';
            errorInput.style.display = 'none';
            errorFooter.innerHTML = '<button class="alert-button confirm">OK</button>';
            
            // Handle OK button
            errorAlert.querySelector('.alert-button.confirm').onclick = function() {
                errorAlert.classList.remove('active');
            };
            
            alert.classList.remove('active');
            errorAlert.classList.add('active');
        }
    };
    
    // Handle cancel button
    const cancelBtn = alert.querySelector('.alert-button.cancel');
    cancelBtn.onclick = function() {
        alert.classList.remove('active');
    };
}

// Prevent video download
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('player');
    if (video) {
        // Prevent keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
            }
        });

        // Prevent right click on video
        video.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // Prevent drag and drop
        video.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });

        // Add custom controls behavior
        video.addEventListener('play', function() {
            console.log('Video is playing');
        });

        video.addEventListener('pause', function() {
            console.log('Video is paused');
        });
    }
});

// Video player debugging
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('player');
    if (video) {
        video.addEventListener('loadstart', () => console.log('Video load started'));
        video.addEventListener('loadeddata', () => console.log('Video data loaded'));
        video.addEventListener('loadedmetadata', () => console.log('Video metadata loaded'));
        video.addEventListener('canplay', () => console.log('Video can start playing'));
        video.addEventListener('playing', () => console.log('Video is playing'));
        video.addEventListener('error', (e) => {
            console.error('Video error:', video.error);
            console.error('Error details:', {
                code: video.error.code,
                message: video.error.message
            });
        });

        // Force video reload
        video.load();
    }
});

function updateRewardTiers() {
    const tiers = document.querySelectorAll('.tier');
    const progress = parseFloat(document.querySelector('.progress-percentage').textContent.replace('%', ''));
    
    tiers.forEach(tier => {
        const tierAmount = parseFloat(tier.dataset.amount);
        const button = tier.querySelector('.select-button');
        
        if (progress >= tierAmount) {
            tier.classList.add('available');
            if (button) {
                button.disabled = false;
            }
        } else {
            tier.classList.remove('available');
            if (button) {
                button.disabled = true;
            }
        }
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup video player
    const video = document.getElementById('player');
    if (video) {
        video.addEventListener('error', function(e) {
            console.error('Video error:', video.error);
            // Try to reload the video
            video.load();
        });
        
        // Force video reload
        video.load();
    }
    
    // Setup stretch goals
    setupStretchGoals();
    
    // Update progress and tiers
    updateProgress();
    updateRewardTiers();
    
    // Check stretch goals
    checkStretchGoals();
});

// Handle smooth scrolling for stretch goals links
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a hash in the URL
    if (window.location.hash === '#stretch-goals-info') {
        setTimeout(() => {
            const element = document.querySelector('.stretch-goals-info');
            if (element) {
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100); // Small delay to ensure page is fully loaded
    }

    // Handle clicks on stretch goal links
    document.querySelectorAll('a[href*="#stretch-goals-info"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href').includes('products.html')) {
                // Don't prevent default for links to other pages
                return;
            }
            e.preventDefault();
            const element = document.querySelector('.stretch-goals-info');
            if (element) {
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}); 