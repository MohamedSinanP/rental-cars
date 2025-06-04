"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDocumentDataWithLLM = extractDocumentDataWithLLM;
// Function to fetch available models from OpenRouter
function fetchAvailableModels() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },
            });
            const data = yield response.json();
            return data.data.map((model) => model.id);
        }
        catch (error) {
            console.error('Error fetching models:', error);
            return ['auto'];
        }
    });
}
function extractDocumentDataWithLLM(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // Fetch available models to ensure valid model ID
            const availableModels = yield fetchAvailableModels();
            let modelId = 'tngtech/deepseek-r1t-chimera:free';
            // Validate model ID
            if (!availableModels.includes(modelId)) {
                console.warn(`Model ${modelId} not found. Falling back to 'auto'.`);
                modelId = 'auto';
            }
            const response = yield fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'your-app-url',
                    'X-Title': 'Your App Name',
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
            const data = (yield response.json());
            if (data.error) {
                console.error('LLM response error:', data.error);
                return `Error: ${data.error.message}`;
            }
            if ((_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) {
                return data.choices[0].message.content;
            }
            console.error('LLM response error:', data);
            return 'Sorry, I could not extract the information from the documents.';
        }
        catch (error) {
            console.error('LLM fetch error:', error);
            return 'An error occurred while querying the LLM.';
        }
    });
}
