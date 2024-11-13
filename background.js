// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "searchAI",
      title: "Search with AI",
      contexts: ["selection"]
    });
  });
  
  // Function to handle the AI search
  async function handleAISearch() {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Execute script to get selected text
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
      });
  
      if (result) {
        chrome.storage.sync.get(['defaultAI', 'prependText'], (data) => {
          const aiService = data.defaultAI || 'perplexity';
          const prependText = data.prependText ? `${data.prependText} ` : '';
          const searchText = prependText + result;
          let searchUrl;
  
          switch(aiService) {
            case 'chatgpt':
              searchUrl = `https://chat.openai.com/?q=${encodeURIComponent(searchText)}`;
              break;
            case 'perplexity':
              searchUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(searchText)}`;
              break;
          }
  
          chrome.tabs.create({ url: searchUrl });
        });
      }
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  
  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "searchAI") {
      const selectedText = info.selectionText;
      
      chrome.storage.sync.get(['defaultAI', 'prependText'], (data) => {
        const aiService = data.defaultAI || 'perplexity';
        const prependText = data.prependText ? `${data.prependText} ` : '';
        const searchText = prependText + selectedText;
        let searchUrl;
  
        switch(aiService) {
          case 'chatgpt':
            searchUrl = `https://chat.openai.com/?q=${encodeURIComponent(searchText)}`;
            break;
          case 'perplexity':
            searchUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(searchText)}`;
            break;
        }
  
        chrome.tabs.create({ url: searchUrl });
      });
    }
  });
  
  // Handle keyboard shortcuts
  chrome.commands.onCommand.addListener((command) => {
    if (command === "search-with-ai") {
      handleAISearch();
    }
  });