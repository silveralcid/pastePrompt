const VALID_AI_SERVICES = ['perplexity', 'chatgpt'];
const DEFAULT_AI = 'perplexity';
const ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9\s_\-.:?]/g;

document.addEventListener('DOMContentLoaded', initializeExtension);

async function initializeExtension() {
    try {
        const dropdown = document.getElementById('aiService');
        const prependInput = document.getElementById('prependText');

        if (!dropdown || !prependInput) {
            throw new Error('Required elements not found');
        }

        const data = await chrome.storage.sync.get(['defaultAI', 'prependText']);
        
        setupAIService(dropdown, data.defaultAI);
        
        if (data.prependText) {
            prependInput.value = data.prependText;
        }

        setupEventListeners(dropdown, prependInput);

    } catch (error) {
        console.error('Extension initialization failed:', error);
    }
}

function setupAIService(dropdown, savedAI) {
    const aiService = VALID_AI_SERVICES.includes(savedAI) ? savedAI : DEFAULT_AI;
    dropdown.value = aiService;
    
    if (!savedAI) {
        chrome.storage.sync.set({ defaultAI: DEFAULT_AI })
            .catch(error => console.error('Failed to set default AI:', error));
    }
}

function setupEventListeners(dropdown, prependInput) {
    const debouncedInputHandler = debounce(handlePrependInput, 300);

    dropdown.addEventListener('change', handleDropdownChange);
    prependInput.addEventListener('input', debouncedInputHandler);
}

function handleDropdownChange(event) {
    const newValue = event.target.value;
    if (VALID_AI_SERVICES.includes(newValue)) {
        chrome.storage.sync.set({ defaultAI: newValue })
            .catch(error => console.error('Failed to save AI preference:', error));
    }
}

function handlePrependInput(event) {
    const input = event.target.value;
    const cleanedInput = sanitizeInput(input);
    
    if (input !== cleanedInput) {
        event.target.value = cleanedInput;
    }
    
    chrome.storage.sync.set({ prependText: cleanedInput })
        .catch(error => console.error('Failed to save prepend text:', error));
}

function sanitizeInput(input) {
    return input.replace(ALLOWED_CHARS_REGEX, '');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}