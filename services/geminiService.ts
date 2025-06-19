
import { FormData } from '../types';

// The generateFullPrompt and prompt generation for refinement logic is now on the server-side (Vercel function).
// This client-side service will just call the Vercel function.

export const generateText = async (formData: FormData): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', { // Endpoint for the Vercel serverless function
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'generate', data: formData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'サーバーからのエラー応答の解析に失敗しました。' }));
      console.error('Error response from /api/gemini (generate):', errorData);
      throw new Error(errorData.error || `サーバーエラー: ${response.status}`);
    }

    const result = await response.json();
    if (typeof result.text !== 'string') {
      console.error('Invalid response structure from /api/gemini (generate):', result);
      throw new Error('サーバーからの応答が期待した形式ではありません。');
    }
    return result.text;

  } catch (error) {
    console.error('Error calling /api/gemini (generate):', error);
    if (error instanceof Error) {
      throw new Error(`テキスト生成エラー: ${error.message}`);
    }
    throw new Error('テキスト生成中に不明なクライアントサイドエラーが発生しました。');
  }
};

export const refineTextWithInstruction = async (
  currentText: string,
  userInstruction: string,
  originalFormData: FormData
): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', { // Endpoint for the Vercel serverless function
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'refine',
        data: { currentText, userInstruction, originalFormData },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'サーバーからのエラー応答の解析に失敗しました。' }));
      console.error('Error response from /api/gemini (refine):', errorData);
      throw new Error(errorData.error || `サーバーエラー(修正時): ${response.status}`);
    }

    const result = await response.json();
    if (typeof result.text !== 'string') {
        console.error('Invalid response structure from /api/gemini (refine):', result);
        throw new Error('サーバーからの応答が期待した形式ではありません(修正時)。');
    }
    return result.text;
    
  } catch (error) {
    console.error('Error calling /api/gemini (refine):', error);
    if (error instanceof Error) {
      throw new Error(`テキスト修正エラー: ${error.message}`);
    }
    throw new Error('テキスト修正中に不明なクライアントサイドエラーが発生しました。');
  }
};