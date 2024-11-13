// Constants
const AI_SERVICES = {
    chatgpt: {
      url: 'https://chat.openai.com/?q=',
      default: false
    },
    perplexity: {
      url: 'https://www.perplexity.ai/search?q=',
      default: true
    }
  };
  
  const CONTEXT_MENU_ID = 'searchAI';
  const COMMAND_ID = 'search-with-ai';
  
  // Initialize extension
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Search with AI',
      contexts: ['selection']
    });
  });
  
  // Utility functions
  async function getStorageData() {
    try {
      const data = await chrome.storage.sync.get(['defaultAI', 'prependText']);
      return {
        aiService: data.defaultAI || Object.keys(AI_SERVICES).find(key => AI_SERVICES[key].default),
        prependText: data.prependText ? `${data.prependText} ` : ''
      };
    } catch (error) {
      console.error('Error accessing storage:', error);
      return {
        aiService: Object.keys(AI_SERVICES).find(key => AI_SERVICES[key].default),
        prependText: ''
      };
    }
  }
  
  function createSearchUrl(text, aiService) {
    if (!AI_SERVICES[aiService]) {
      console.error(`Invalid AI service: ${aiService}`);
      aiService = Object.keys(AI_SERVICES).find(key => AI_SERVICES[key].default);
    }
    return `${AI_SERVICES[aiService].url}${encodeURIComponent(text)}`;
  }
  
  async function performSearch(searchText) {
    try {
      const { aiService, prependText } = await getStorageData();
      const fullSearchText = prependText + searchText;
      const searchUrl = createSearchUrl(fullSearchText, aiService);
      await chrome.tabs.create({ url: searchUrl });
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }
  
  // Handle selected text search
  async function handleSelectedTextSearch(selectedText) {
    if (!selectedText?.trim()) {
      console.warn('No text selected');
      return;
    }
    await performSearch(selectedText);
  }
  
  // Handle keyboard shortcut search
  async function handleKeyboardSearch() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');
  
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString().trim()
      });
  
      if (result) {
        await handleSelectedTextSearch(result);
      }
    } catch (error) {
      console.error('Error executing keyboard shortcut search:', error);
    }
  }
  
  // Event Listeners
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID) {
      handleSelectedTextSearch(info.selectionText);
    }
  });
  
  chrome.commands.onCommand.addListener((command) => {
    if (command === COMMAND_ID) {
      handleKeyboardSearch();
    }
  });