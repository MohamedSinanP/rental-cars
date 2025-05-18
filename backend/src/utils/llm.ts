type OpenRouterResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
};

// Function to fetch available models from OpenRouter
async function fetchAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    const data = await response.json();
    return data.data.map((model: { id: string }) => model.id);
  } catch (error) {
    console.error('Error fetching models:', error);
    return ['auto']; // Fallback to Auto Router
  }
}

export async function extractDocumentDataWithLLM(prompt: string): Promise<string> {
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
            content: `
      You are a car document assistant. Your job is to answer only with a short, direct reply that starts with "Answer:".
      Do not explain your reasoning. Do not repeat the user's question.
      Only give the final response based on the documents or context.
      Your answers must always be under 2 lines.
    `.trim(),

          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        models: [modelId, 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o'],
      }),
    });

    const data = (await response.json()) as OpenRouterResponse;

    if (data.error) {
      console.error('LLM response error:', data.error);
      return `Error: ${data.error.message}`;
    }

    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    console.error('LLM response error:', data);
    return 'Sorry, I could not extract the information from the documents.';
  } catch (error) {
    console.error('LLM fetch error:', error);
    return 'An error occurred while querying the LLM.';
  }
}