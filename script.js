let currentLang = 'en';
let translations = {};

// Load translations from config.json
fetch('../config.json')
    .then(response => response.json())
    .then(data => {
        translations = {
            en: {
                pressKit: data.pressKit.en
            },
            es: {
                pressKit: data.pressKit.es
            }
        };
        initializeLanguage();
    })
    .catch(error => {
        console.error('Error loading translations:', error);
    });

// Initialize language
function initializeLanguage() {
    // Set initial language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    
    // Add click handlers to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });
}

// Set language
function setLanguage(lang) {
    console.log('Setting language to:', lang);
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
            btn.textContent = translations[lang].language[lang].toUpperCase();
        } else {
            btn.classList.remove('active');
            btn.textContent = translations[lang].language[btn.dataset.lang].toUpperCase();
        }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const keys = key.split('.');
        let value = translations[lang];
        
        // Navigate through nested keys
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key} in language: ${lang}`);
                return;
            }
        }
        
        if (value) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = value;
            } else {
                element.textContent = value;
            }
        }
    });
}

// Load and parse the configuration
fetch('../config.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(config => {
        console.log('Config loaded successfully:', config);
        
        // Populate galleries and videos
        config.sections.forEach(section => {
            console.log('Processing section:', section.title);
            
            if (section.type === 'gallery') {
                const galleryId = section.title.toLowerCase().replace(/\s+/g, '-') + '-gallery';
                const gallery = document.getElementById(galleryId);
                
                if (!gallery) {
                    console.error(`Gallery container not found: ${galleryId}`);
                    return;
                }
                
                section.items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'gallery-item';
                    div.innerHTML = `
                        <img src="${item.src}" alt="${item.caption}">
                        <p class="caption" data-i18n="gallery.${item.caption.toLowerCase().replace(/\s+/g, '')}">${item.caption}</p>
                    `;
                    gallery.appendChild(div);
                });
            } else if (section.type === 'videos') {
                let container;
                if (section.title === 'Live Shows') {
                    container = document.getElementById('live-shows-gallery');
                    // Create carousel container
                    const carouselContainer = document.createElement('div');
                    carouselContainer.className = 'carousel-container';
                    container.appendChild(carouselContainer);
                    container = carouselContainer;
                } else {
                    container = document.getElementById('video-container');
                }
                
                if (!container) {
                    console.error(`Video container not found for section: ${section.title}`);
                    return;
                }

                // Create carousel wrapper
                const carouselWrapper = document.createElement('div');
                carouselWrapper.className = 'carousel-wrapper';
                container.appendChild(carouselWrapper);
                
                section.items.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = 'video-item';
                    const translationKey = section.title === 'Live Shows' ? 
                        `videos.liveShows.${item.title.toLowerCase().replace(/\s+/g, '')}` :
                        `videos.musicVideos.${item.title.toLowerCase().replace(/\s+/g, '')}`;
                    
                    div.innerHTML = `
                        <div class="video-container">
                            <iframe 
                                src="https://www.youtube.com/embed/${item.id}?rel=0" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                        <p class="caption" data-i18n="${translationKey}">${item.title}</p>
                    `;
                    carouselWrapper.appendChild(div);
                });

                // Add carousel controls if it's the Live Shows section
                if (section.title === 'Live Shows') {
                    const controls = document.createElement('div');
                    controls.className = 'carousel-controls';
                    controls.innerHTML = `
                        <button class="carousel-prev">❮</button>
                        <button class="carousel-next">❯</button>
                    `;
                    container.appendChild(controls);

                    // Add carousel functionality
                    const wrapper = carouselWrapper;
                    const prevBtn = controls.querySelector('.carousel-prev');
                    const nextBtn = controls.querySelector('.carousel-next');
                    let currentIndex = 0;

                    function updateCarousel() {
                        const items = wrapper.querySelectorAll('.video-item');
                        const itemWidth = items[0].offsetWidth;
                        wrapper.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                    }

                    prevBtn.addEventListener('click', () => {
                        const items = wrapper.querySelectorAll('.video-item');
                        currentIndex = Math.max(0, currentIndex - 1);
                        updateCarousel();
                    });

                    nextBtn.addEventListener('click', () => {
                        const items = wrapper.querySelectorAll('.video-item');
                        currentIndex = Math.min(items.length - 1, currentIndex + 1);
                        updateCarousel();
                    });

                    // Initialize carousel
                    updateCarousel();
                }
            }
        });
    })
    .catch(error => {
        console.error('Error loading or processing config:', error);
    });

// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const languageContents = document.querySelectorAll('.language-content');
    
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            
            // Update active button
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show/hide content based on language
            languageContents.forEach(content => {
                if (content.getAttribute('data-lang') === lang) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });

            // Update translations
            setLanguage(lang);
        });
    });

    // Initial language setup
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
});

// Load press photos from config
function loadPressPhotos() {
    const galleryContainer = document.getElementById('press-photos-gallery');
    if (!galleryContainer) return;

    fetch('../config.json')
        .then(response => response.json())
        .then(data => {
            const gallerySection = data.sections.find(section => section.type === 'gallery');
            if (gallerySection && gallerySection.items) {
                gallerySection.items.forEach(item => {
                    if (item.type === 'image') {
                        const img = document.createElement('img');
                        img.src = '../' + item.src;
                        img.alt = item.caption;
                        img.title = item.caption;
                        galleryContainer.appendChild(img);
                    }
                });
            }
        })
        .catch(error => console.error('Error loading press photos:', error));
}

// Initialize press photos if on media page
if (window.location.pathname.includes('media.html')) {
    loadPressPhotos();
} 