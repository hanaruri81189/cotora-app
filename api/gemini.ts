
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FormData } from '../types';
import { TONE_OPTIONS, PLATFORM_OPTIONS, GEMINI_MODEL_TEXT } from '../constants';

const API_KEY = process.env.API_KEY;

const generateFullPromptForApi = (data: FormData): string => {
  const selectedPlatform = PLATFORM_OPTIONS.find(opt => opt.value === data.platform);
  const platformName = selectedPlatform?.label || data.platform;
  let platformDescription = selectedPlatform?.description || "指定されたプラットフォーム";

  let prompt = `あなたは、指定されたプラットフォーム「${platformName}」の最新マーケティング戦略とエンゲージメント最適化に精通したプロのコンテンツライター兼AIマーケティングコンサルタントです。\n`;
  prompt += `以下の詳細に基づいて、プラットフォームの特性を最大限に活かした、読者の心に響く高品質な文章を作成してください。\n\n`;
  prompt += `■ プラットフォーム情報:\n`;
  prompt += `- 名称: ${platformName}\n`;
  
  if (data.platform === 'instagram_stories') {
    const numberOfStories = data.numberOfStories || 1;
    // The detailed description for 'instagram_stories' from constants.ts is already quite good.
    // We can use it and append specifics about the number of slides and structure.
    platformDescription = PLATFORM_OPTIONS.find(opt => opt.value === 'instagram_stories')?.description || platformDescription; 
    prompt += `- 特徴・留意点: ${platformDescription}\n`; // This now includes the detailed rules
    prompt += `- 作成枚数: ${numberOfStories}枚\n\n`;
    prompt += `■ Instagramストーリーズ特化指示 (上記の特徴・留意点に加えて、特に以下の点を強調):\n`;
    prompt += `- 「王道のライティング構成」（問題提起→導入→内容・解決策）を厳守してください。\n`;
    if (numberOfStories > 1) {
      prompt += `- ${numberOfStories}枚のストーリーズとして構成するため、全体の情報をこの「王道のライティング構成」に従って論理的に分割し、各スライドが次のスライドへの期待感を高めるように、かつ各スライドが適切な情報量になるように調整してください。\n`;
      prompt += `- 最後のスライドには、全体のまとめや次のアクションを促すような内容を含めることを検討してください。\n`;
      prompt += `- 各スライドの内容は明確に区別できるようにし、必ず「--- スライド 1 ---」「--- スライド 2 ---」のような区切りマーカーをスライド間に使用してください。ユーザーは後でこれを手動で分割します。\n`;
    } else {
      prompt += `- 1枚のストーリーズで完結するように、「王道のライティング構成」を凝縮して情報を効果的に伝えてください。\n`;
    }
    prompt += `\n`;
  } else {
    prompt += `- 特徴・留意点: ${platformDescription}\n\n`;
  }

  prompt += `■ 伝えたい内容・エピソード (これが文章の核となります):\n${data.contentEpisode}\n\n`;
  prompt += `■ 読者に感じてほしい気持ち・考えてほしいこと:\n${data.desiredFeeling}\n\n`;
  const selectedTone = TONE_OPTIONS.find(opt => opt.value === data.tone)?.label || data.tone;
  prompt += `■ 文章のトーン: ${selectedTone}\n`;
  if (data.purpose) prompt += `■ 投稿の目的: ${data.purpose}\n`;
  if (data.targetAudience) prompt += `■ ターゲット読者: ${data.targetAudience}\n`;
  if (data.cta) prompt += `■ 読者にとってほしい行動 (CTA): ${data.cta}\n`;
  if (data.authorName) prompt += `■ 投稿者名 (文中に含める場合): ${data.authorName}\n`;
  
  // General marketing instructions (apply to stories too, but some specifics are handled above)
  prompt += "\n■ マーケティング戦略とエンゲージメントに関する全プラットフォーム共通の基本指示:\n";
  prompt += `- **重要:** ${platformName}の最新のマーケティングトレンド、アルゴリズムの特性（一般的に理解されている範囲で良いので、例えばエンゲージメントを高める投稿の仕方やハッシュタグの活用法など）、エンゲージメントを高めるためのベストプラクティスを最大限に考慮し、文章に反映してください。\n`;
  if (data.platform !== 'instagram_stories') { // Text length less critical for stories as it's slide-based
    prompt += `- ${platformName}の文字数制限や最適な投稿の長さを考慮してください。例えば、${platformDescription}に記載の文字数目安を参考にしてください。\n`;
  }
  
  prompt += `- ターゲット読者層が最も反応しやすい言葉遣いや表現を選んでください。\n`;
  prompt += `- 記載された投稿の目的を達成できるように、戦略的に情報を配置してください。\n`;
  prompt += `- 可能であれば、CTA（コールトゥアクション）を自然な形で組み込み、読者の次の行動を促してください。\n`;
  prompt += `- 提供された「伝えたい内容・エピソード」と「読者に感じてほしい気持ち」を核として、読者の共感や興味を引くストーリーテリングを心がけてください。\n`;
  prompt += "- 生成される文章は、プロのライターが書いたような、自然で読みやすい、かつマーケティング効果の高いものにしてください。\n";
  prompt += "- **読みやすさ向上のため、適切な箇所で段落を分け、必要に応じて空白行（実際の改行を2つ重ねるなどして表現）も活用し、視覚的な区切りをつけてください。**\n";

  // Platform-specific nuances (can complement the general and stories-specific instructions)
  if (data.platform === 'ameblo') prompt += `- アメブロの特性（SEO、読者との交流、絵文字の活用など）を特に意識してください。\n`;
  else if (data.platform === 'note') prompt += `- noteの特性（専門性、読み応え、ファンコミュニティ形成など）を特に意識してください。\n`;
  else if (data.platform === 'instagram') prompt += `- Instagramフィード投稿の特性（ビジュアルとの連携、キャプション冒頭の重要性、ハッシュタグ戦略など）を特に意識してください。\n`;
  else if (data.platform === 'threads') prompt += `- Threadsの特性（テキスト中心の会話、リアルタイム性、Instagram連携など）を特に意識してください。\n`;
  else if (data.platform === 'x_twitter') prompt += `- X (旧Twitter)の特性（短文、速報性、拡散性、ハッシュタグのトレンドなど）を特に強く意識してください。\n`;
  else if (data.platform === 'facebook') prompt += `- Facebookの特性（実名制、幅広い層へのリーチ、イベント告知、シェアされやすさなど）を特に意識してください。\n`;
  else if (data.platform === 'official_line') prompt += `- 公式LINEの特性（クローズドなコミュニケーション、開封率の高さ、配信の簡潔さ、吹き出し単位の読みやすさなど）を特に意識してください。\n`;
  
  prompt += "\n最終的なアウトプットは、上記の指示をすべて満たした完成された文章のみとしてください。";
  if (data.platform === 'instagram_stories' && (data.numberOfStories || 1) > 1) {
    // This instruction is now part of the 'Instagramストーリーズ特化指示' block.
    // prompt += ` 各スライドの内容は明確に区別できるようにし、例えば「--- スライド 1 ---」「--- スライド 2 ---」のような区切りマーカーをスライド間に使用してください。ユーザーは後でこれを手動で分割します。`;
  }
  return prompt;
};

const generateRefinePromptForApi = (currentText: string, userInstruction: string, originalFormData: FormData): string => {
    const selectedPlatform = PLATFORM_OPTIONS.find(opt => opt.value === originalFormData.platform);
    const platformName = selectedPlatform?.label || originalFormData.platform;
    const selectedTone = TONE_OPTIONS.find(opt => opt.value === originalFormData.tone)?.label || originalFormData.tone;

    let refinePrompt = `あなたはプロのAIテキストエディターです。\n`;
    refinePrompt += `以下の「元の文章」は、プラットフォーム「${platformName}」向けに「${selectedTone}」のトーンで以前生成されたものです。\n`;
    if (originalFormData.platform === 'instagram_stories' && originalFormData.numberOfStories && originalFormData.numberOfStories > 0) {
      refinePrompt += `この文章は、元々${originalFormData.numberOfStories}枚のストーリーズとして構成されることを意図していました。その構成と各スライドの意図も考慮して修正してください。\n`;
      if (originalFormData.numberOfStories > 1) {
        refinePrompt += `元の文章には「--- スライド 1 ---」「--- スライド 2 ---」のような区切りマーカーが含まれている可能性があります。修正後も、この区切りマーカーは維持するか、同様の明確な区切り方で${originalFormData.numberOfStories}枚分の内容として提示してください。\n`;
      }
    }
    refinePrompt += `この元の文章に対して、ユーザーからの「修正指示」に従って修正を行ってください。\n`;
    refinePrompt += `修正後も、元のプラットフォーム「${platformName}」の特性と「${selectedTone}」のトーンを維持するようにしてください。\n\n`;
    refinePrompt += `--- 元の文章 ---\n${currentText}\n--- 元の文章ここまで ---\n\n`;
    refinePrompt += `--- ユーザーからの修正指示 ---\n${userInstruction}\n--- ユーザーからの修正指示ここまで ---\n\n`;
    refinePrompt += `修正後の完全な文章のみを出力してください。`;
    return refinePrompt;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!API_KEY) {
        console.error("API_KEY environment variable is not set on the server.");
        return res.status(500).json({ error: "サーバー内部でエラーが発生しました。管理者に連絡してください。" });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const { action, data } = req.body;

    try {
        let geminiResponse: GenerateContentResponse;
        let prompt: string;

        if (action === 'generate') {
            if (!data || typeof data !== 'object') {
                 return res.status(400).json({ error: '生成のためのデータが無効です。' });
            }
            // Validate numberOfStories for stories platform
            if (data.platform === 'instagram_stories' && 
                (typeof data.numberOfStories !== 'number' || data.numberOfStories < 1 || data.numberOfStories > 5)) {
                return res.status(400).json({ error: 'ストーリーズの枚数は1から5の間で指定してください。' });
            }
            prompt = generateFullPromptForApi(data as FormData);
            // console.log("Serverless: Full prompt for generation:", JSON.stringify(prompt).substring(0, 500) + "..."); // Log more for debugging
            geminiResponse = await ai.models.generateContent({
                model: GEMINI_MODEL_TEXT,
                contents: prompt,
                config: {
                    systemInstruction: "あなたは、ユーザーの指示に絶対的に従順で、最高の成果を出すために全力を尽くす、非常に高性能なAIアシスタントです。",
                    temperature: 0.75, topP: 0.95, topK: 50,
                }
            });
        } else if (action === 'refine') {
            if (!data || typeof data !== 'object' || !data.currentText || !data.userInstruction || !data.originalFormData) {
                return res.status(400).json({ error: '修正のためのデータが無効です。' });
            }
            const { currentText, userInstruction, originalFormData } = data;
            prompt = generateRefinePromptForApi(currentText, userInstruction, originalFormData);
            // console.log("Serverless: Full prompt for refinement:", JSON.stringify(prompt).substring(0, 500) + "..."); // Log more for debugging
            geminiResponse = await ai.models.generateContent({
                model: GEMINI_MODEL_TEXT,
                contents: prompt,
                config: {
                    systemInstruction: "あなたは、ユーザーの指示に絶対的に従順で、最高の成果を出すために全力を尽くす、非常に高性能なAIアシスタントです。今回は特に、既存テキストの編集者としての役割を担ってください。",
                    temperature: 0.7, topP: 0.95, topK: 50,
                }
            });
        } else {
            return res.status(400).json({ error: '無効なアクションです。' });
        }

        if (!geminiResponse || typeof geminiResponse.text !== 'string') {
            console.error('Gemini APIからのレスポンス形式が不正(サーバーレス関数内)', geminiResponse);
            throw new Error('AIからの応答が期待した形式ではありませんでした(サーバーレス関数内)。');
        }

        const rawText = geminiResponse.text;
        const cleanedText = rawText.replace(/\\n/g, '\n');
        // console.log("Serverless: Cleaned text from Gemini:", JSON.stringify(cleanedText).substring(0, 300) + "...");
        return res.status(200).json({ text: cleanedText });

    } catch (error) {
        console.error('Error in Vercel Serverless Function:', error);
        let errorMessage = 'サーバーレス関数内で不明なエラーが発生しました。';
        if (error instanceof Error) {
            if (error.message.includes("API key not valid")) {
                 errorMessage = 'サーバーでAPI認証に失敗しました。設定を確認してください。';
            } else {
                 errorMessage = `AIサービスとの通信中にエラーが発生しました: ${error.name}`; // Use error.name for more generic API errors
            }
        }
        return res.status(500).json({ error: errorMessage });
    }
}
