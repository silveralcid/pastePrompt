chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "searchAI",
      title: "Search with AI",
      contexts: ["selection"]
    });
  });
  
  async function handleAISearch() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
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
  
  chrome.commands.onCommand.addListener((command) => {
    if (command === "search-with-ai") {
      handleAISearch();
    }
  });