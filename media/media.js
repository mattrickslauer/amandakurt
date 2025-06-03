let currentLang = 'en';
let translations = {};

// Load translations from config.json
fetch('/config.json')
    .then(response => response.json())
    .then(data => {
        console.log('Config loaded:', data);
        translations = data;  // Store the entire config
        console.log('Translations set:', translations);
        initializeLanguage();
        // Load media links after translations are set
        console.log('Loading media links after translations...');
        loadMediaLinks();
    })
    .catch(error => {
        console.error('Error loading translations:', error);
    });

// Initialize language
function initializeLanguage() {
    // Set initial language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') || 'en';
    console.log('Initializing language with:', savedLang);
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
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        console.log('Processing element with key:', key);
        const keys = key.split('.');
        let value = translations;
        
        // Navigate through nested keys
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key}`);
                return;
            }
        }
        
        if (value) {
            console.log('Setting text for key:', key, 'to:', value);
            element.textContent = value;
        }
    });

    // Show/hide content based on language
    document.querySelectorAll('.language-content').forEach(content => {
        console.log('Setting visibility for content:', content.getAttribute('data-lang'));
        if (content.getAttribute('data-lang') === lang) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });

    // Reload media links to ensure they're visible
    console.log('Reloading media links after language change');
    loadMediaLinks();
}

// Load press photos from config
function loadPressPhotos() {
    const galleryContainer = document.getElementById('press-photos-gallery');
    if (!galleryContainer) return;

    fetch('/config.json')
        .then(response => response.json())
        .then(data => {
            const gallerySection = data.sections.find(section => section.type === 'gallery');
            if (gallerySection && gallerySection.items) {
                gallerySection.items.forEach(item => {
                    if (item.type === 'image') {
                        const img = document.createElement('img');
                        img.src = '../' + item.src;  // Add relative path prefix
                        img.alt = item.caption;
                        img.title = item.caption;
                        galleryContainer.appendChild(img);
                    }
                });
            }
        })
        .catch(error => console.error('Error loading press photos:', error));
}

// Load media links from config
function loadMediaLinks() {
    console.log('Loading media links...');
    console.log('Current translations:', translations);
    
    // Clear existing content
    const enContainer = document.getElementById('media-links-en');
    const esContainer = document.getElementById('media-links-es');
    
    if (!enContainer) {
        console.error('English media links container not found!');
        return;
    }
    if (!esContainer) {
        console.error('Spanish media links container not found!');
        return;
    }
    
    // Clear existing content
    enContainer.innerHTML = '';
    esContainer.innerHTML = '';
    
    console.log('Containers found and cleared:', { enContainer, esContainer });

    // Check if translations and mediaLinks exist
    if (!translations) {
        console.error('Translations object is undefined');
        return;
    }

    console.log('MediaLinks data:', translations.mediaLinks);

    // Load English links
    if (translations.mediaLinks && translations.mediaLinks.en && translations.mediaLinks.en.items) {
        console.log('Loading English links:', translations.mediaLinks.en.items);
        translations.mediaLinks.en.items.forEach(item => {
            console.log('Creating English link for:', item.title);
            const link = document.createElement('a');
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'media-link';
            
            const title = document.createElement('span');
            title.className = 'link-title';
            title.textContent = item.title;
            
            const date = document.createElement('span');
            date.className = 'link-date';
            date.textContent = item.date;
            
            link.appendChild(title);
            link.appendChild(date);
            enContainer.appendChild(link);
            console.log('Added English link:', item.title);
        });
    } else {
        console.error('No English media links found in config. Data structure:', {
            hasMediaLinks: !!translations.mediaLinks,
            hasEn: !!(translations.mediaLinks && translations.mediaLinks.en),
            hasItems: !!(translations.mediaLinks && translations.mediaLinks.en && translations.mediaLinks.en.items)
        });
    }

    // Load Spanish links
    if (translations.mediaLinks && translations.mediaLinks.es && translations.mediaLinks.es.items) {
        console.log('Loading Spanish links:', translations.mediaLinks.es.items);
        translations.mediaLinks.es.items.forEach(item => {
            console.log('Creating Spanish link for:', item.title);
            const link = document.createElement('a');
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'media-link';
            
            const title = document.createElement('span');
            title.className = 'link-title';
            title.textContent = item.title;
            
            const date = document.createElement('span');
            date.className = 'link-date';
            date.textContent = item.date;
            
            link.appendChild(title);
            link.appendChild(date);
            esContainer.appendChild(link);
            console.log('Added Spanish link:', item.title);
        });
    } else {
        console.error('No Spanish media links found in config. Data structure:', {
            hasMediaLinks: !!translations.mediaLinks,
            hasEs: !!(translations.mediaLinks && translations.mediaLinks.es),
            hasItems: !!(translations.mediaLinks && translations.mediaLinks.es && translations.mediaLinks.es.items)
        });
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    loadPressPhotos();
}); 