// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('aiService');
    const prependInput = document.getElementById('prependText');
    
    // Load saved preferences
    chrome.storage.sync.get(['defaultAI', 'prependText'], (data) => {
      if (data.defaultAI) {
        dropdown.value = data.defaultAI;
      } else {
        dropdown.value = 'perplexity';
        chrome.storage.sync.set({ defaultAI: 'perplexity' });
      }
  
      if (data.prependText) {
        prependInput.value = data.prependText;
      }
    });
  
    // Save AI service preference when changed
    dropdown.addEventListener('change', (e) => {
      chrome.storage.sync.set({ defaultAI: e.target.value });
    });
  
    // Validate and save prepend text when changed
    prependInput.addEventListener('input', (e) => {
      const input = e.target.value;
      // Only allow letters, numbers, spaces, and basic punctuation
      const cleanedInput = input.replace(/[^a-zA-Z0-9\s_\-.:?]/g, '');
      
      // Update input value if invalid characters were removed
      if (input !== cleanedInput) {
        e.target.value = cleanedInput;
      }
      
      chrome.storage.sync.set({ prependText: cleanedInput });
    });
  });