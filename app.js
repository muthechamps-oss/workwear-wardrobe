// Enhanced app with AI learning, style quiz, camera upload, and shopping
let wardrobe = [];
let userPreferences = {
    style: '',
    colors: '',
    fit: '',
    priority: '',
    tags: []
};
let aiLearning = {
    likedOutfits: [],
    dislikedOutfits: [],
    learnedPreferences: {}
};
let styleQuizCompleted = false;

// Shopping items database (simulated)
const shoppingItems = [
    { id: 1, category: 'shirt', color: 'white', style: 'Button-Down', formality: 'professional', price: '$45', brand: 'Everlane', url: 'https://example.com/shirt1' },
    { id: 2, category: 'pants', color: 'black', style: 'Dress Pants', formality: 'professional', price: '$68', brand: 'Banana Republic', url: 'https://example.com/pants1' },
    { id: 3, category: 'shoes', color: 'black', style: 'Pumps', formality: 'professional', price: '$89', brand: 'Clarks', url: 'https://example.com/shoes1' },
    { id: 4, category: 'jacket', color: 'navy', style: 'Blazer', formality: 'professional', price: '$120', brand: 'J.Crew', url: 'https://example.com/jacket1' },
    { id: 5, category: 'dress', color: 'blue', style: 'Sheath Dress', formality: 'professional', price: '$75', brand: 'Ann Taylor', url: 'https://example.com/dress1' },
    { id: 6, category: 'accessory', color: 'pattern', style: 'Silk Scarf', formality: 'business-casual', price: '$35', brand: 'Madewell', url: 'https://example.com/scarf1' }
];

// DOM elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateStats();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('addItemBtn').addEventListener('click', addItemFromForm);
    document.getElementById('cameraUploadBtn').addEventListener('click', addItemFromCamera);
    document.getElementById('recommendBtn').addEventListener('click', generateRecommendations);
    document.getElementById('submitQuizBtn').addEventListener('click', submitStyleQuiz);
    document.getElementById('resetBtn').addEventListener('click', resetApp);
    
    // Quiz option selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const question = this.closest('.quiz-question');
            question.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function addItemFromForm() {
    const category = document.getElementById('category').value;
    const color = document.getElementById('color').value;
    const style = document.getElementById('style').value || 'Standard';
    const formality = document.getElementById('formality').value;
    
    addItemToWardrobe(category, color, style, formality);
    document.getElementById('style').value = '';
}

function addItemFromCamera() {
    const cameraItem = document.getElementById('camera-item').value;
    if (!cameraItem) {
        alert('Please select an item to upload');
        return;
    }
    
    // Map camera selections to items
    const itemMap = {
        'white-button-down': ['shirt', 'white', 'Button-Down', 'professional'],
        'black-pants': ['pants', 'black', 'Dress Pants', 'professional'],
        'navy-blazer': ['jacket', 'navy', 'Blazer', 'professional'],
        'black-pumps': ['shoes', 'black', 'Pumps', 'professional'],
        'gray-cardigan': ['sweater', 'gray', 'Cardigan', 'business-casual'],
        'pencil-skirt': ['skirt', 'black', 'Pencil Skirt', 'professional'],
        'loafers': ['shoes', 'brown', 'Loafers', 'business-casual'],
        'blue-dress': ['dress', 'blue', 'Sheath Dress', 'professional']
    };
    
    const [category, color, style, formality] = itemMap[cameraItem];
    addItemToWardrobe(category, color, style, formality);
    document.getElementById('camera-item').value = '';
}

function addItemToWardrobe(category, color, style, formality) {
    const item = {
        id: Date.now(),
        category: category,
        color: color,
        style: style,
        formality: formality,
        addedDate: new Date().toISOString()
    };
    
    wardrobe.push(item);
    updateInventoryDisplay();
    updateStats();
    saveToLocalStorage();
    
    // Show success with animation
    const originalText = document.getElementById('addItemBtn').textContent;
    document.getElementById('addItemBtn').textContent = '✓ Added!';
    setTimeout(() => {
        document.getElementById('addItemBtn').textContent = originalText;
    }, 1000);
}

function updateInventoryDisplay() {
    const inventoryList = document.getElementById('inventoryList');
    const emptyInventory = document.getElementById('emptyInventory');
    
    if (wardrobe.length === 0) {
        emptyInventory.style.display = 'block';
        inventoryList.innerHTML = '';
        return;
    }
    
    emptyInventory.style.display = 'none';
    inventoryList.innerHTML = '';
    
    wardrobe.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="item-category">${item.category}</div>
            <div class="item-details">${item.color} • ${item.style}</div>
            <div class="item-details">${item.formality}</div>
            <button class="delete-item" data-id="${item.id}">×</button>
        `;
        inventoryList.appendChild(itemElement);
    });
    
    // Add delete functionality
    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            wardrobe = wardrobe.filter(item => item.id !== itemId);
            updateInventoryDisplay();
            updateStats();
            saveToLocalStorage();
        });
    });
}

function submitStyleQuiz() {
    const answers = {};
    let allAnswered = true;
    
    document.querySelectorAll('.quiz-question').forEach((question, index) => {
        const selected = question.querySelector('.quiz-option.selected');
        if (selected) {
            answers[`q${index + 1}`] = selected.getAttribute('data-value');
        } else {
            allAnswered = false;
        }
    });
    
    if (!allAnswered) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    // Process answers into preferences
    userPreferences = {
        style: answers.q1 || '',
        colors: answers.q2 || '',
        fit: answers.q3 || '',
        priority: answers.q4 || '',
        tags: []
    };
    
    // Create tags from answers
    const tags = [];
    if (answers.q1) tags.push(answers.q1);
    if (answers.q2) tags.push(answers.q2);
    if (answers.q3) tags.push(answers.q3);
    if (answers.q4) tags.push(answers.q4);
    userPreferences.tags = [...new Set(tags)];
    
    // Update UI
    updateStyleProfile();
    styleQuizCompleted = true;
    saveToLocalStorage();
    
    // Show success
    alert('Style profile saved! Recommendations will now be personalized for you.');
}

function updateStyleProfile() {
    const profileDiv = document.getElementById('styleProfile');
    const tagsDiv = document.getElementById('preferenceTags');
    
    if (!userPreferences.style) {
        profileDiv.innerHTML = '<p>Complete the quiz to see your style profile.</p>';
        tagsDiv.innerHTML = '';
        return;
    }
    
    let profileText = `Your style is <strong>${userPreferences.style}</strong>. `;
    profileText += `You prefer <strong>${userPreferences.colors}</strong> colors with a <strong>${userPreferences.fit}</strong> fit. `;
    profileText += `Your priority is <strong>${userPreferences.priority}</strong>.`;
    
    profileDiv.innerHTML = `<p>${profileText}</p>`;
    
    // Update tags
    tagsDiv.innerHTML = '';
    userPreferences.tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'preference-tag';
        tagElement.textContent = tag;
        tagsDiv.appendChild(tagElement);
    });
}

function generateRecommendations() {
    if (wardrobe.length === 0) {
        alert('Please add some items to your wardrobe first!');
        return;
    }
    
    const occasion = document.getElementById('occasion').value;
    const weather = document.getElementById('weather').value;
    
    // Generate outfits with AI learning
    const outfits = generateOutfitsWithAI(occasion, weather);
    
    // Display recommendations
    displayOutfits(outfits);
    
    // Generate shopping suggestions
    generateShoppingSuggestions();
    
    // Switch to recommendations tab
    document.querySelector('[data-tab="recommendations"]').click();
    
    // Save to localStorage
    saveToLocalStorage();
}

function generateOutfitsWithAI(occasion, weather) {
    const outfits = [];
    const targetFormality = getFormalityForOccasion(occasion);
    
    // Filter items considering AI learned preferences
    let suitableItems = wardrobe.filter(item => {
        // Check formality
        if (Math.abs(getFormalityLevel(item.formality) - getFormalityLevel(targetFormality)) > 1) {
            return false;
        }
        
        // Apply AI learned preferences if available
        if (aiLearning.learnedPreferences.dislikedColors && 
            aiLearning.learnedPreferences.dislikedColors.includes(item.color)) {
            return false; // Skip disliked colors
        }
        
        return true;
    });
    
    // If we have user preferences, prioritize matching items
    if (styleQuizCompleted) {
        suitableItems.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            
            // Score based on color preference
            if (userPreferences.colors === 'neutrals' && 
                ['black', 'white', 'gray', 'navy', 'beige'].includes(a.color)) scoreA += 2;
            if (userPreferences.colors === 'neutrals' && 
                ['black', 'white', 'gray', 'navy', 'beige'].includes(b.color)) scoreB += 2;
            
            // Score based on fit preference
            if (userPreferences.fit === 'tailored' && 
                a.style.toLowerCase().includes('fitted')) scoreA += 1;
            if (userPreferences.fit === 'tailored' && 
                b.style.toLowerCase().includes('fitted')) scoreB += 1;
            
            return scoreB - scoreA;
        });
    }

    // Generate 3 outfits
    for (let i = 0; i < 3; i++) {
        const outfit = {
            id: Date.now() + i,
            name: getOutfitName(occasion, i),
            items: [],
            missingItems: [],
            rating: 0,
            occasion: occasion,
            weather: weather
        };
        
        // Try to create a complete outfit
        const categoriesNeeded = [
            ['shirt', 'pants'],
            ['dress'],
            ['shirt', 'skirt']
        ][i % 3];
        
        // Add available items
        categoriesNeeded.forEach(category => {
            const available = suitableItems.filter(item => item.category === category);
            if (available.length > 0) {
                const selected = available[Math.floor(Math.random() * available.length)];
                outfit.items.push({...selected, owned: true});
            } else {
                // Mark as missing
                outfit.missingItems.push({
                    category: category,
                    color: getSuggestedColor(category),
                    style: getSuggestedStyle(category),
                    formality: targetFormality
                });
            }
        });
        
        // Add jacket if available and appropriate
        if (weather === 'winter' || targetFormality === 'professional') {
            const jackets = suitableItems.filter(item => item.category === 'jacket');
            if (jackets.length > 0) {
                const selected = jackets[Math.floor(Math.random() * jackets.length)];
                outfit.items.push({...selected, owned: true});
            }
        }
        
        // Calculate AI-enhanced rating
        outfit.rating = calculateAIOutfitRating(outfit, targetFormality);
        
        outfits.push(outfit);
    }
    
    // Sort by rating
    outfits.sort((a, b) => b.rating - a.rating);
    
    return outfits;
}

function calculateAIOutfitRating(outfit, targetFormality) {
    let rating = 50; // Base
    
    // Color coordination
    const colors = outfit.items.map(item => item.color);
    const uniqueColors = [...new Set(colors)];
    rating += (4 - Math.min(uniqueColors.length, 4)) * 5;
    
    // Formality match
    const formalityMatch = outfit.items.every(item => 
        Math.abs(getFormalityLevel(item.formality) - getFormalityLevel(targetFormality)) <= 1);
    if (formalityMatch) rating += 15;
    
    // AI learned preferences bonus
    if (styleQuizCompleted) {
        // Bonus for matching user's color preference
        if (userPreferences.colors === 'neutrals' && 
            outfit.items.every(item => ['black', 'white', 'gray', 'navy', 'beige'].includes(item.color))) {
            rating += 10;
        }
        
        // Bonus for matching user's style
        if (userPreferences.style === 'classic' && 
            outfit.items.every(item => ['shirt', 'pants', 'dress'].includes(item.category))) {
            rating += 10;
        }
    }
    
    return Math.min(100, rating);
}

function displayOutfits(outfits) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';
    
    if (outfits.length === 0) {
        container.innerHTML = '<p>No outfits could be generated. Try adding more items to your wardrobe.</p>';
        return;
    }
    
    outfits.forEach(outfit => {
        const outfitElement = document.createElement('div');
        outfitElement.className = 'outfit';
        outfitElement.dataset.outfitId = outfit.id;
        
        // Create items HTML
        let itemsHTML = '';
        outfit.items.forEach(item => {
            itemsHTML += `
                <div class="item owned">
                    <div class="item-category">${item.category} ✓</div>
                    <div class="item-details">${item.color} ${item.style}</div>
                </div>
            `;
        });
        
        outfit.missingItems.forEach(item => {
            itemsHTML += `
                <div class="item missing">
                    <div class="item-category">${item.category} (Missing)</div>
                    <div class="item-details">${item.color} ${item.style}</div>
                </div>
            `;
        });
        
        // Create stars for rating
        const stars = '★'.repeat(Math.floor(outfit.rating/20)) + '☆'.repeat(5 - Math.floor(outfit.rating/20));
        
        outfitElement.innerHTML = `
            <h3>${outfit.name}</h3>
            <div class="item-list">${itemsHTML}</div>
            <div class="outfit-rating">
                <div><span class="rating">${stars} (${outfit.rating}/100)</span></div>
                <p>${getOutfitSuggestion(outfit.rating)}</p>
                <div class="feedback-buttons">
                    <button class="feedback-like" data-outfit-id="${outfit.id}">👍 I Like This</button>
                    <button class="feedback-dislike" data-outfit-id="${outfit.id}">👎 Not My Style</button>
                </div>
            </div>
        `;
        
        container.appendChild(outfitElement);
    });
    
    // Add feedback event listeners
    document.querySelectorAll('.feedback-like').forEach(btn => {
        btn.addEventListener('click', function() {
            const outfitId = this.getAttribute('data-outfit-id');
            recordOutfitFeedback(outfitId, true);
        });
    });
    
    document.querySelectorAll('.feedback-dislike').forEach(btn => {
        btn.addEventListener('click', function() {
            const outfitId = this.getAttribute('data-outfit-id');
            recordOutfitFeedback(outfitId, false);
        });
    });
}

function recordOutfitFeedback(outfitId, liked) {
    if (liked) {
        aiLearning.likedOutfits.push(outfitId);
    } else {
        aiLearning.dislikedOutfits.push(outfitId);
    }
    
    // Learn from feedback
    learnFromFeedback(outfitId, liked);
    
    // Update UI
    updateAILearningDisplay();
    saveToLocalStorage();
    
    // Show confirmation
    alert(`Thanks for your feedback! The AI will ${liked ? 'prioritize' : 'avoid'} similar outfits.`);
}

function learnFromFeedback(outfitId, liked) {
    // Simple AI learning: track disliked colors from disliked outfits
    if (!liked) {
        // Find the outfit
        const outfitContainer = document.querySelector(`[data-outfit-id="${outfitId}"]`);
        if (outfitContainer) {
            const colors = [];
            outfitContainer.querySelectorAll('.item').forEach(item => {
                const text = item.querySelector('.item-details').textContent;
                const colorMatch = text.match(/^(black|navy|gray|white|beige|blue|green|red|pattern)/);
                if (colorMatch) colors.push(colorMatch[1]);
            });
            
            // Add to disliked colors
            if (!aiLearning.learnedPreferences.dislikedColors) {
                aiLearning.learnedPreferences.dislikedColors = [];
            }
            colors.forEach(color => {
                if (!aiLearning.learnedPreferences.dislikedColors.includes(color)) {
                    aiLearning.learnedPreferences.dislikedColors.push(color);
                }
            });
        }
    }
}

function generateShoppingSuggestions() {
    const shoppingSection = document.getElementById('shoppingSection');
    const shoppingList = document.getElementById('shoppingList');
    
    // Find missing items across all generated outfits
    const missingCategories = new Set();
    document.querySelectorAll('.item.missing .item-category').forEach(el => {
        const category = el.textContent.split(' ')[0];
        missingCategories.add(category.toLowerCase());
    });
    
    if (missingCategories.size === 0) {
        shoppingSection.style.display = 'none';
        return;
    }
    
    shoppingSection.style.display = 'block';
    shoppingList.innerHTML = '';
    
    // Show relevant shopping items
    shoppingItems.forEach(item => {
        if (missingCategories.has(item.category)) {
            const itemElement = document.createElement('div');
            itemElement.className = 'shopping-item';
            itemElement.innerHTML = `
                <div>
                    <strong>${item.color} ${item.style}</strong><br>
                    <small>${item.brand} • ${item.price}</small>
                </div>
                <a href="${item.url}" target="_blank" class="buy-button">View</a>
            `;
            shoppingList.appendChild(itemElement);
        }
    });
}

function updateStats() {
    document.getElementById('totalItems').textContent = wardrobe.length;
    
    // Calculate possible outfits (simplified)
    const topCount = wardrobe.filter(item => ['shirt', 'dress', 'sweater'].includes(item.category)).length;
    const bottomCount = wardrobe.filter(item => ['pants', 'skirt'].includes(item.category)).length;
    const outfitCount = topCount * bottomCount;
    document.getElementById('outfitCount').textContent = outfitCount;
    
    // Calculate style match based on quiz completion
    const styleScore = styleQuizCompleted ? 
        Math.min(100, Math.floor(outfitCount / 10) * 10) : 0;
    document.getElementById('styleScore').textContent = `${styleScore}%`;
}

function updateAILearningDisplay() {
    const likedCount = aiLearning.likedOutfits.length;
    const dislikedCount = aiLearning.dislikedOutfits.length;
    const totalRated = likedCount + dislikedCount;
    
    document.getElementById('likedOutfits').textContent = likedCount;
    document.getElementById('dislikedOutfits').textContent = dislikedCount;
    
    // Calculate AI "accuracy" based on diversity of feedback
    const accuracy = totalRated > 0 ? 
        Math.min(100, Math.floor((likedCount / totalRated) * 100)) : 0;
    document.getElementById('aiAccuracy').textContent = `${accuracy}%`;
    
    // Update progress bar
    const progress = Math.min(100, totalRated * 10);
    document.getElementById('aiProgress').style.width = `${progress}%`;
    document.getElementById('aiProgressText').textContent = `${progress}%`;
    
    // Update insights
    const insights = document.getElementById('aiInsights');
    if (totalRated === 0) {
        insights.innerHTML = '<p>The AI is learning your preferences. Rate outfits to help it improve.</p>';
    } else {
        let insightText = `<p>Based on your ${totalRated} ratings, the AI has learned: `;
        if (aiLearning.learnedPreferences.dislikedColors) {
            insightText += `You tend to dislike ${aiLearning.learnedPreferences.dislikedColors.join(', ')} colors. `;
        }
        if (likedCount > dislikedCount * 2) {
            insightText += 'You generally like the recommendations.';
        }
        insightText += '</p>';
        insights.innerHTML = insightText;
    }
}

// Helper functions
function getFormalityForOccasion(occasion) {
    const formalityMap = {
        'meeting': 'professional',
        'interview': 'professional',
        'presentation': 'professional',
        'office': 'business-casual',
        'casual-friday': 'casual'
    };
    return formalityMap[occasion] || 'business-casual';
}

function getFormalityLevel(formality) {
    const levels = ['casual', 'business-casual', 'professional', 'formal'];
    return levels.indexOf(formality);
}

function getOutfitName(occasion, index) {
    const names = {
        meeting: ['Executive Power Look', 'Confidence Builder', 'Boardroom Ready'],
        office: ['Office Classic', 'Smart Casual', 'Polished Professional'],
        'casual-friday': ['Friday Chic', 'Relaxed Professional', 'Weekend Ready'],
        presentation: ['Command Attention', 'Audience Focus', 'Polished Presenter'],
        interview: ['First Impression', 'Competence & Confidence', 'Hire Me Now']
    };
    return names[occasion] ? names[occasion][index % names[occasion].length] : `Outfit ${index + 1}`;
}

function getOutfitSuggestion(rating) {
    if (rating >= 80) return "Perfect match for your style and occasion!";
    if (rating >= 60) return "Great choice that fits the occasion well.";
    return "This outfit works but could be improved with different pieces.";
}

function getSuggestedColor(category) {
    const colorMap = {
        'shirt': 'white',
        'pants': 'black',
        'skirt': 'black',
        'dress': 'navy',
        'jacket': 'navy',
        'sweater': 'gray',
        'shoes': 'black',
        'accessory': 'pattern'
    };
    return colorMap[category] || 'black';
}

function getSuggestedStyle(category) {
    const styleMap = {
        'shirt': 'Button-Down',
        'pants': 'Dress Pants',
        'skirt': 'Pencil Skirt',
        'dress': 'Sheath Dress',
        'jacket': 'Blazer',
        'sweater': 'Cardigan',
        'shoes': 'Pumps',
        'accessory': 'Scarf'
    };
    return styleMap[category] || 'Classic';
}

// Local storage functions
function saveToLocalStorage() {
    const appData = {
        wardrobe: wardrobe,
        userPreferences: userPreferences,
        aiLearning: aiLearning,
        styleQuizCompleted: styleQuizCompleted,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('workwearAppData', JSON.stringify(appData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('workwearAppData');
    if (saved) {
        try {
            const appData = JSON.parse(saved);
            wardrobe = appData.wardrobe || [];
            userPreferences = appData.userPreferences || {};
            aiLearning = appData.aiLearning || { likedOutfits: [], dislikedOutfits: [], learnedPreferences: {} };
            styleQuizCompleted = appData.styleQuizCompleted || false;
            
            updateInventoryDisplay();
            updateStyleProfile();
            updateAILearningDisplay();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function resetApp() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        wardrobe = [];
        userPreferences = {
            style: '',
            colors: '',
            fit: '',
            priority: '',
            tags: []
        };
        aiLearning = {
            likedOutfits: [],
            dislikedOutfits: [],
            learnedPreferences: {}
        };
        styleQuizCompleted = false;
        
        localStorage.removeItem('workwearAppData');
        
        updateInventoryDisplay();
        updateStyleProfile();
        updateAILearningDisplay();
        updateStats();
        
        // Reset form fields
        document.getElementById('style').value = '';
        document.getElementById('camera-item').value = '';
        
        // Reset quiz
        document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
        
        alert('App has been reset. All data has been cleared.');
    }
}