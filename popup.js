document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['temperature', 'systemPrompt', 'maxTokens', 'apiKey', 'model'], function(items) {
    document.getElementById('temperature').value = items.temperature || 0.7;
    document.getElementById('temperatureValue').textContent = items.temperature || 0.7;
    document.getElementById('systemPrompt').value = items.systemPrompt || 'אני עוזר AI';
    document.getElementById('maxTokens').value = items.maxTokens || 1024;
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('model').value = items.model || 'claude-3-5-sonnet-20240620';
  });

  // Temperature slider
  document.getElementById('temperature').addEventListener('input', function() {
    document.getElementById('temperatureValue').textContent = this.value;
  });

  // Toggle password visibility
  document.getElementById('togglePassword').addEventListener('click', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const eyeIcon = this.querySelector('i');
    
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    } else {
      apiKeyInput.type = 'password';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  });

  // Save settings
  document.getElementById('saveButton').addEventListener('click', function() {
    const settings = {
      temperature: parseFloat(document.getElementById('temperature').value),
      systemPrompt: document.getElementById('systemPrompt').value,
      maxTokens: parseInt(document.getElementById('maxTokens').value),
      apiKey: document.getElementById('apiKey').value,
      model: document.getElementById('model').value
    };

    chrome.storage.sync.set(settings, function() {
      const saveMessage = document.getElementById('saveMessage');
      saveMessage.textContent = 'Settings saved successfully!';
      console.log('Settings saved:', settings);  // Add this line for debugging
      setTimeout(() => { saveMessage.textContent = ''; }, 3000);
    });
  });

  // Update max tokens based on selected model
  document.getElementById('model').addEventListener('change', function() {
    const maxTokensInput = document.getElementById('maxTokens');
    const selectedModel = this.value;
    
    if (selectedModel.includes('claude-3-5-sonnet')) {
      maxTokensInput.max = '200000';
    } else if (selectedModel.includes('claude-3-opus')) {
      maxTokensInput.max = '4096';
    } else if (selectedModel.includes('claude-3-sonnet')) {
      maxTokensInput.max = '3072';
    } else if (selectedModel.includes('claude-3-haiku')) {
      maxTokensInput.max = '2048';
    } else if (selectedModel.includes('claude-2')) {
      maxTokensInput.max = '100000';
    } else if (selectedModel.includes('claude-instant')) {
      maxTokensInput.max = '100000';
    } else if (selectedModel.includes('gpt-4o') || selectedModel.includes('gpt-4-turbo')) {
      maxTokensInput.max = '16384';
    } else if (selectedModel.includes('gpt-4')) {
      maxTokensInput.max = '8192';
    } else if (selectedModel.includes('gpt-3.5-turbo')) {
      maxTokensInput.max = '4096';
    } else {
      maxTokensInput.max = '2048';
    }

    // Adjust current value if it exceeds new max
    if (parseInt(maxTokensInput.value) > parseInt(maxTokensInput.max)) {
      maxTokensInput.value = maxTokensInput.max;
    }
  });
});