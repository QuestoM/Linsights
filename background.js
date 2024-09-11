console.log("Linsights background script loaded");

// Function to make API call to Claude
async function callClaudeAPI(systemPrompt, userPrompt, apiKey, model, temperature, maxTokens) {
  try {
    console.log("Calling Claude API with settings:", { model, temperature, maxTokens, systemPrompt });
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt  // Changed this line
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${response.statusText}. Error: ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Error in callClaudeAPI:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background script:", message);
  if (message.action === "generateInsights") {
    console.log("Generating insights for post content:", message.postContent);

    // Retrieve settings from storage every time we generate insights
    chrome.storage.sync.get(['apiKey', 'model', 'temperature', 'maxTokens', 'systemPrompt'], async function(items) {
      const apiKey = items.apiKey;
      if (!apiKey) {
        console.error("API key is not set");
        sendResponse({error: "API key is not set. Please set it in the extension settings."});
        return;
      }
      console.log("API key is set");

      const model = items.model || 'claude-3-5-sonnet-20240620';
      const temperature = parseFloat(items.temperature) || 0.7;
      const maxTokens = parseInt(items.maxTokens) || 1024;
      const systemPrompt = items.systemPrompt || `You are an AI assistant designed to engage authentically on social media platforms, particularly LinkedIn. Your responses should be thoughtful, concise, and tailored to each post.
Key Traits:

Knowledgeable across various industries
Insightful and analytical
Encouraging and supportive
Adaptable communication style
Curious and thought-provoking

Response Guidelines:

Match the language of the original post
Keep responses brief (2-4 sentences)
Provide unique perspectives or valuable information
Use a conversational and genuine tone
Avoid generic introductions or self-references
Adjust tone to align with the post's sentiment
Incorporate subtle engagement prompts or questions
Draw from a broad knowledge base without specific claims of expertise

Best Practices:

Carefully analyze the post before responding
Add value through insights, encouragement, or relevant information
Use emojis judiciously and only when appropriate
Craft specific, thoughtful responses for each unique post
Maintain a professional yet approachable demeanor
Foster inclusive and constructive discussions

Your objective: Generate concise, engaging responses that contribute meaningfully to online conversations, encourage further dialogue, and provide value to the community.`;

      console.log("Using settings:", { model, temperature, maxTokens, systemPrompt });

      try {
        const insights = await callClaudeAPI(systemPrompt, message.postContent, apiKey, model, temperature, maxTokens);
        console.log("Generated insights:", insights);
        sendResponse({insights: insights});
      } catch (error) {
        console.error("Error generating insights:", error);
        sendResponse({error: error.message || 'Unknown error occurred'});
      }
    });

    return true;  // Indicates that the response is sent asynchronously
  }
});
