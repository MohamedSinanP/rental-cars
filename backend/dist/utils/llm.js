"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDocumentDataWithLLM = extractDocumentDataWithLLM;
// Function to fetch available models from OpenRouter
async function fetchAvailableModels() {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
        });
        const data = await response.json();
        return data.data.map((model) => model.id);
    }
    catch (error) {
        console.error('Error fetching models:', error);
        return ['auto']; // Fallback to Auto Router
    }
}
async function extractDocumentDataWithLLM(prompt) {
    try {
        // Fetch available models to ensure valid model ID
        const availableModels = await fetchAvailableModels();
        let modelId = 'tngtech/deepseek-r1t-chimera:free'; // Your preferred model
        // Validate model ID
        if (!availableModels.includes(modelId)) {
            console.warn(`Model ${modelId} not found. Falling back to 'auto'.`);
            modelId = 'auto'; // Use Auto Router as fallback
        }
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'your-app-url', // Optional for leaderboard visibility
                'X-Title': 'Your App Name', // Optional for discoverability
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant for answering questions based on scanned car documents (RC, PUC, insurance).',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                models: [modelId, 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o'], // Fallback models
            }),
        });
        const data = (await response.json());
        if (data.error) {
            console.error('LLM response error:', data.error);
            return `Error: ${data.error.message}`;
        }
        if (data?.choices?.[0]?.message?.content) {
            return data.choices[0].message.content;
        }
        console.error('LLM response error:', data);
        return 'Sorry, I could not extract the information from the documents.';
    }
    catch (error) {
        console.error('LLM fetch error:', error);
        return 'An error occurred while querying the LLM.';
    }
}
//# sourceMappingURL=llm.js.map