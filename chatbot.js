document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWrapper = document.getElementById('chatbot-wrapper');
    const closeBtn = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chatbot-input');
    const chatSend = document.getElementById('chatbot-send');
    const chatMessages = document.getElementById('chatbot-messages');
    const quickReplies = document.querySelectorAll('.quick-reply');
    
    // Initialize the chatbot
    initChatbot();
    
    // Setup event listeners
    function initChatbot() {
        // Toggle chatbot visibility
        if (chatToggle) {
            chatToggle.addEventListener('click', toggleChatbot);
        }
        
        // Close chatbot
        if (closeBtn) {
            closeBtn.addEventListener('click', toggleChatbot);
        }
        
        // Send message on button click
        if (chatSend) {
            chatSend.addEventListener('click', sendMessage);
        }
        
        // Send message on Enter key
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        // Handle quick replies
        if (quickReplies.length > 0) {
            quickReplies.forEach(reply => {
                reply.addEventListener('click', function() {
                    const query = this.getAttribute('data-query');
                    if (query) {
                        // Set input value to the query
                        if (chatInput) {
                            chatInput.value = query;
                        }
                        // Send the message
                        sendMessage();
                    }
                });
            });
        }

        // Welcome message on first load
        if (chatMessages && !localStorage.getItem('chatbot_welcomed')) {
            addMessageToChat('bot', "Welcome to the Farming Assistant! I can help with questions about crops, pests, soil management, and more. Type a question or try one of the quick replies below.");
            localStorage.setItem('chatbot_welcomed', 'true');
        }
        
        // Apply theme to chatbot based on current theme
        applyCurrentTheme();
        
        // Listen for theme changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'theme') {
                applyCurrentTheme();
            }
        });
    }
    
    // Apply the current theme to chatbot elements
    function applyCurrentTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        if (chatWrapper) {
            if (currentTheme === 'dark') {
                chatWrapper.classList.add('dark-theme');
            } else {
                chatWrapper.classList.remove('dark-theme');
            }
        }
    }
    
    // Toggle chatbot visibility
    function toggleChatbot() {
        if (chatWrapper) {
            chatWrapper.classList.toggle('open');
            if (chatToggle) {
                chatToggle.classList.toggle('active');
            }
            
            // If opening chatbot, focus on input
            if (chatWrapper.classList.contains('open') && chatInput) {
                chatInput.focus();
            }
        }
    }
    
    // Chat history for context
    let chatHistory = [];
    
    // Send a message to the chatbot
    function sendMessage() {
        if (!chatInput || !chatInput.value.trim()) return;
        
        const userMessage = chatInput.value.trim();
        
        // Add user message to chat
        addMessageToChat('user', userMessage);
        
        // Add to chat history
        chatHistory.push({ role: 'user', content: userMessage });
        
        // Clear input
        chatInput.value = '';
        
        // Focus back on input
        chatInput.focus();
        
        // Process the message and get a response (with a typing delay)
        setTimeout(() => {
            processUserMessage(userMessage);
        }, 500);
    }
    
    // Add a message to the chat
    function addMessageToChat(sender, message) {
        if (!chatMessages) return;
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = sender === 'user' ? 'user-message' : 'bot-message';
        messageEl.textContent = message;
        
        // Add custom data attribute for theme identification
        messageEl.setAttribute('data-sender', sender);
        
        // Add to chat
        chatMessages.appendChild(messageEl);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to chat history if bot message
        if (sender === 'bot') {
            chatHistory.push({ role: 'assistant', content: message });
            
            // Keep history to a reasonable size
            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (!chatMessages) return;
        
        const typingEl = document.createElement('div');
        typingEl.className = 'bot-message typing-indicator';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        typingEl.id = 'typing-indicator';
        
        chatMessages.appendChild(typingEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
    }
    
    // Process user message and get a response
    async function processUserMessage(message) {
        // Show typing indicator
        showTypingIndicator();
        
        // Check if we have an API key
        const apiKey = localStorage.getItem('gemini_api_key');
        
        if (apiKey && apiKey.trim() !== '') {
            try {
                // Try to get a response from the Gemini API
                const response = await getGeminiResponse(message, apiKey);
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response
                addMessageToChat('bot', response);
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                
                // Check if the error is related to an invalid API key
                let errorMessage = "I couldn't connect to the AI service. ";
                
                if (error.message.includes('403') || error.message.includes('invalid') || error.message.includes('400')) {
                    errorMessage += "Your API key might be invalid or incorrectly formatted. Please check it's entered correctly in your profile settings.";
                    // Clear the invalid API key
                    localStorage.removeItem('gemini_api_key');
                    
                    // Use fallback response
                    const fallbackResponse = getMockResponse(message);
                    setTimeout(() => {
                        addMessageToChat('bot', "In the meantime, here's what I can tell you: " + fallbackResponse);
                    }, 1000);
                } else {
                    // If it's another type of error, use mock response
                    const fallbackResponse = getMockResponse(message);
                    errorMessage += "Here's a basic response: " + fallbackResponse;
                }
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add error message
                addMessageToChat('bot', errorMessage);
            }
        } else {
            // No API key or empty key, use mock response
            const response = getMockResponse(message);
            
            // Add some delay to simulate processing time
            setTimeout(() => {
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response with note about API key
                addMessageToChat('bot', response);
                
                // If this is the first user message, add a note about the API key
                if (chatHistory.filter(msg => msg.role === 'user').length === 1) {
                    setTimeout(() => {
                        addMessageToChat('bot', "For more advanced responses, you can add your Gemini API key in your profile settings.");
                    }, 1000);
                }
            }, 1000);
        }
    }
    
    // Get a response from Gemini API
    async function getGeminiResponse(message, apiKey) {
        // Prepare the system prompt
        const systemPrompt = {
            role: "system",
            content: `You are an AI farming assistant specialized in agricultural knowledge. Your expertise includes:
            1. Crop selection, cultivation, and care
            2. Soil health and management
            3. Pest and disease identification and control
            4. Agricultural best practices and innovations
            5. Sustainable and organic farming methods
            6. Weather impacts on agriculture
            7. Irrigation and water management

            Respond to user queries with accurate, helpful information about farming and agriculture.
            If asked about non-farming topics, politely redirect the conversation to agricultural topics.
            Keep your responses concise but informative.`
        };
        
        // Create context from previous messages (limited for token efficiency)
        const recentHistory = chatHistory.slice(-10);
        
        // Prepare messages array with system prompt and recent history
        const messages = [systemPrompt, ...recentHistory];
        
        try {
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: messages,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 800,
                    },
                }),
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Extract the response text
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }
    
    // Get a mock response based on user message
    function getMockResponse(message) {
        message = message.toLowerCase();
        
        // Check for specific keywords and return relevant responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! How can I help you with your farming questions today?";
        }
        
        if (message.includes('api') || message.includes('key')) {
            return "To use the full AI capabilities, you can add your Gemini API key in your profile settings. You can get a free API key from Google AI Studio (ai.google.dev). Without an API key, I'll provide helpful pre-written responses to common farming questions.";
        }
        
        if (message.includes('weather')) {
            return "Weather forecasts are available on the Weather Dashboard. For specific crop recommendations based on weather, consider factors like temperature range, precipitation, and growing season length.";
        }
        
        if (message.includes('pest') || message.includes('disease')) {
            return "For pest and disease management, it's important to identify the specific issue first. Consider integrated pest management (IPM) approaches which combine biological controls, resistant varieties, and minimal chemical interventions.";
        }
        
        if (message.includes('crop rotation')) {
            return "Crop rotation helps manage soil fertility and reduces pest/disease problems. Try to avoid planting crops from the same family in the same spot for at least 3 years. Use our Crop Rotation planner for personalized recommendations.";
        }
        
        if (message.includes('fertilizer') || message.includes('nutrient')) {
            return "Balanced fertilization is key to healthy crops. Consider soil testing to determine exact nutrient needs. Organic options include compost, manure, and cover crops. Chemical fertilizers should be applied according to specific crop requirements.";
        }
        
        if (message.includes('organic') || message.includes('natural')) {
            return "Organic farming relies on natural processes and materials. Key practices include crop rotation, green manures, compost, biological pest control, and mechanical cultivation. Certification requires following specific standards for at least 3 years.";
        }
        
        if (message.includes('water') || message.includes('irrigation')) {
            return "Efficient irrigation is crucial for water conservation. Drip irrigation can be 90% efficient compared to 50-70% for sprinklers. Consider soil moisture sensors, weather-based scheduling, and drought-resistant varieties where appropriate.";
        }
        
        if (message.includes('soil') || message.includes('dirt')) {
            return "Healthy soil is the foundation of farming. Key factors include organic matter content, pH balance, nutrient levels, and microbial activity. Regular testing and amendments like compost can help maintain optimal soil health.";
        }
        
        if (message.includes('aphid')) {
            return "Aphids can be managed through several approaches: 1) Beneficial insects like ladybugs and lacewings, 2) Neem oil or insecticidal soap sprays, 3) Strong water sprays to dislodge them, and 4) For severe infestations, systemic insecticides may be needed. Always monitor plants regularly for early detection.";
        }
        
        if (message.includes('clay soil')) {
            return "For clay soils, good crop choices include brassicas (cabbage, kale), root vegetables like carrots and beets, beans, and certain fruit trees. Improve clay soil by adding organic matter, avoiding working it when wet, and considering raised beds for better drainage.";
        }
        
        // Default response for unrecognized queries
        return "I don't have specific information on that topic yet. For more detailed assistance, consider consulting with your local agricultural extension service or a professional agronomist.";
    }
});

/* Additional CSS to inject via JavaScript for theme support */
document.addEventListener('DOMContentLoaded', function() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add the CSS rules for dark theme support
    style.textContent = `
        .chatbot-wrapper.dark-theme {
            background-color: #1e1e1e;
            color: #f0f0f0;
        }
        
        .chatbot-wrapper.dark-theme .chatbot-messages {
            background-color: #1e1e1e;
        }
        
        .chatbot-wrapper.dark-theme .bot-message {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        .chatbot-wrapper.dark-theme .user-message {
            background-color: #4caf50;
            color: white;
        }
        
        .chatbot-wrapper.dark-theme .chatbot-input-container {
            background-color: #1e1e1e;
            border-top: 1px solid #444;
        }
        
        .chatbot-wrapper.dark-theme .chatbot-input-container input {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        .chatbot-wrapper.dark-theme .chatbot-quick-replies {
            background-color: #1e1e1e;
            border-top: 1px solid #444;
        }
        
        .chatbot-wrapper.dark-theme .quick-reply {
            background-color: #2c2c2c;
            color: #f0f0f0;
            border: 1px solid #444;
        }
        
        .chatbot-wrapper.dark-theme .quick-reply:hover {
            background-color: #4caf50;
            color: white;
        }
    `;
    
    // Append to head
    document.head.appendChild(style);
}); 