import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SNSType } from '../types'; // Adjust path
import { GEMINI_MODEL_NAME } from '../constants'; // Adjust path

interface RefineRequestBody {
    currentText: string;
    chatInstruction: string;
    selectedSnsType: SNSType; // Added to provide context to the model
    storyPages?: number; // Added for Instagram Stories context
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return res.status(500).json({ error: "APIキーがサーバーに設定されていません。" });
    }

    try {
        const { currentText, chatInstruction, selectedSnsType, storyPages } = req.body as RefineRequestBody;

        if (!currentText || typeof currentText !== 'string' || 
            !chatInstruction || typeof chatInstruction !== 'string' || 
            !selectedSnsType || typeof selectedSnsType !== 'string') {
            return res.status(400).json({ error: "必須パラメータ（currentText, chatInstruction, selectedSnsType）が不足しているか、型が正しくありません。" });
        }

        const aiInstance = new GoogleGenAI({ apiKey });

        let systemInstructionText = `あなたは文章編集アシスタントです。提供された元原稿と追加の指示に基づいて、文章を修正・改善してください。ユーザーの指示に注意深く従い、元の文章の文脈やトーンを可能な限り維持しつつ、自然で魅力的な文章に仕上げてください。特に、プラットフォーム（${selectedSnsType}）の特性を考慮してください。`;
        if (selectedSnsType === SNSType.INSTAGRAM_STORIES && storyPages) {
            systemInstructionText += ` Instagramストーリーズの場合は、現在${storyPages}枚構成であることを意識し、各部分が独立して読めるように、かつ全体として一貫性があるように調整してください。ストーリーズの各テキスト間は、明確に区切るために空行を2行入れてください。`;
        }
        
        const userPromptString = `現在の文章は以下の通りです。これを元に、あなたの指示を反映させてください。\n\n現在の文章:\n「${currentText}」\n\n追加の指示:\n「${chatInstruction}」`;

        // Using generateContent for a single turn conversation as per new guidelines
        // For actual chat history, you would build up the 'contents' array with user/model turns.
        // But for a simple refine based on current text + instruction, this is fine.
        const response: GenerateContentResponse = await aiInstance.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: userPromptString, // User prompt string
            config: {
                systemInstruction: systemInstructionText, // System instruction string
            }
        });
        
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("Error in /api/refine:", error);
        if (error instanceof Error) {
             if (error.message.includes('API key not valid') || error.message.includes('denied') || error.message.includes('API_KEY_INVALID')) {
                return res.status(401).json({ error: "APIキーが無効か、権限がありません。" });
            }
            return res.status(500).json({ error: `テキスト修正中にエラーが発生しました: ${error.message}` });
        }
        return res.status(500).json({ error: "テキスト修正中に不明なサーバーエラーが発生しました。" });
    }
}