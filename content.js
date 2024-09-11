console.log("Linsights content script loaded");

function addLinsightsButton() {
  console.log("Adding Linsights buttons to posts");
  const posts = document.querySelectorAll('.feed-shared-update-v2');
  
  posts.forEach(post => {
    if (!post.querySelector('.linsights-button')) {
      const actionBar = post.querySelector('.feed-shared-social-action-bar');
      if (actionBar) {
        const linsightsButton = createLinsightsButton();
        actionBar.appendChild(linsightsButton);
        console.log("Linsights button added to a post");
      } else {
        console.log("Action bar not found for a post");
      }
    }
  });
}

function createLinsightsButton() {
  const button = document.createElement('button');
  button.className = 'artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view social-actions-button linsights-button';
  button.innerHTML = `
    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" alt="Linsights" style="width: 20px; height: 20px; margin-right: 5px;">
    <span>Linsights</span>
  `;
  button.addEventListener('click', handleLinsightsClick);
  return button;
}

function handleLinsightsClick(event) {
  console.log("Linsights button clicked");
  const button = event.currentTarget;
  const post = button.closest('.feed-shared-update-v2');
  if (post) {
    console.log("Post found for clicked button");
    // Start loading animation
    button.classList.add('loading');
    
    // Check if the span element exists before setting its textContent
    const spanElement = button.querySelector('span');
    if (spanElement) {
      spanElement.textContent = 'Analyzing...';
    } else {
      console.log("Span element not found in button");
    }

    const postContent = extractPostContent(post);
    console.log("Extracted post content:", postContent);
    chrome.runtime.sendMessage({action: "generateInsights", postContent: postContent}, (response) => {
      console.log("Received response from background script:", response);
      // Stop loading animation
      button.classList.remove('loading');
      
      // Check if the span element exists before setting its textContent
      if (spanElement) {
        spanElement.textContent = 'Linsights';
      }

      if (response && response.insights) {
        console.log("Calling insertInsights with:", response.insights);
        insertInsights(post, response.insights);
      } else {
        console.error('Failed to generate insights:', response.error);
        alert(`Failed to generate insights: ${response.error}`);
      }
    });
  } else {
    console.error("Post not found for clicked button");
  }
}

function extractPostContent(post) {
  const contentElement = post.querySelector('.feed-shared-update-v2__description');
  return contentElement ? contentElement.textContent.trim() : '';
}

function insertInsights(post, insights) {
  console.log("Attempting to insert insights:", insights);
  
  // Function to open the comment box
  function openCommentBox() {
    const commentButton = post.querySelector('button[aria-label="Comment"]');
    if (commentButton) {
      console.log("Clicking comment button");
      commentButton.click();
      return true;
    } else {
      console.log("Comment button not found");
      return false;
    }
  }

  // Function to insert insights into the comment box
  function insertIntoCommentBox() {
    console.log("Searching for comment box");
    let commentBox = post.querySelector('.ql-editor[data-placeholder="Add a comment…"]');
    
    if (commentBox) {
      console.log("Comment box found, inserting insights");
      // Clear existing content
      commentBox.innerHTML = '';
      
      // Insert new content
      const paragraph = document.createElement('p');
      paragraph.textContent = insights;
      commentBox.appendChild(paragraph);
      
      // Trigger input event to activate the "Post" button
      commentBox.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("Insights inserted into comment box:", insights);
      return true;
    } else {
      console.log("Comment box not found");
      return false;
    }
  }

  // Try to open the comment box and insert insights
  if (!openCommentBox()) {
    console.error("Failed to open comment box");
    return;
  }

  // Wait for the comment box to appear and insert insights
  let attempts = 0;
  const maxAttempts = 20;
  const attemptInterval = 250; // 250ms

  function attemptInsert() {
    if (insertIntoCommentBox()) {
      console.log("Insights inserted successfully");
    } else if (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts} failed, trying again in ${attemptInterval}ms`);
      setTimeout(attemptInsert, attemptInterval);
    } else {
      console.error("Failed to insert insights after maximum attempts");
    }
  }

  // Start the first attempt after a short delay
  setTimeout(attemptInsert, 500);
}

// Initial run and set up observer
addLinsightsButton();
const observer = new MutationObserver(addLinsightsButton);
observer.observe(document.body, { childList: true, subtree: true });

console.log("Linsights setup complete");