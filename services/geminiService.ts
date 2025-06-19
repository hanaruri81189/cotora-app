
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationParams, SNSType, Candidate } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

function getPlatformSpecificInstructions(params: GenerationParams): string {
  const { snsType, storyPages } = params;
  switch (snsType) {
    case SNSType.AMEBLO:
      return "アメブロの記事として、約500文字から1500文字で作成してください。読者との共感を大切にし、親しみやすい日常の出来事や感情を日記風に表現し、絵文字を効果的に使用してください。記事の最後には、読者にコメントや「いいね」を促すような一言を添えてください。記事タイトルや本文には、関連するキーワードを自然に含めることを意識してください。";
    case SNSType.NOTE:
      return "noteの記事として、約800文字から2000文字で作成してください。専門的な知識、深い考察、体験談などを読み応えのあるコンテンツとして提供し、論理的で分かりやすい文章構成を心がけてください。読者がじっくりと読めるような、価値のある情報提供を重視してください。導入部分で読者の興味を引く工夫をし、必要であれば小見出しを使って情報を整理してください。";
    case SNSType.X:
      return "X (旧Twitter) のツイートとして、最大140文字（日本語）で、簡潔かつインパクトのあるものにしてください。エンゲージメントを高めるために、質問を投げかけたり、会話を促すような工夫も検討してください。画像や動画を添付することを前提としたテキストも良いでしょう。必要であれば、ツイートの最後に自然な形で1～2個の関連性の高いハッシュタグを含めてください。";
    case SNSType.INSTAGRAM:
      return "Instagramのフィード投稿用キャプションとして、約300文字から500文字で作成してください。リールや写真投稿を魅力的に補足する内容にし、読者の目を引くように、関連性の高い絵文字を効果的に使用してください。質問や共感を促す言葉でエンゲージメントを高め、保存したくなるような役立つ情報やストーリーを提供しましょう。キャプションの最後に、自然な形で3-5個の関連性の高いハッシュタグを含めてください。プロフィールへの誘導やキーワードも意識してください。";
    case SNSType.INSTAGRAM_STORIES:
      const numPages = storyPages || 3; // Default to 3 pages if not specified
      let pageInstruction = "";
      if (numPages === 1) {
        pageInstruction = `1枚のストーリーズとして生成します。画面いっぱいに表示されることを想定し、比較的多くの情報を盛り込み、一つのまとまったメッセージとして完結させてください。テキスト量は他の枚数指定の場合よりも多くなるようにしてください。`;
      } else {
        pageInstruction = `全部で${numPages}枚のストーリーズを想定して、連続したテキスト群を生成します。各ストーリーズ（各テキストブロック）は簡潔に、情報を効果的に分割・要約してください。${numPages}枚の全体でストーリーが展開するように、各枚の役割分担（導入、本論、結論、問いかけなど）も意識してください。${numPages}が多いほど、1枚あたりのテキストはより短く、ポイントを絞ったものにしてください。`;
      }
      return `Instagramのストーリーズ用に、テキストを生成します。\n${pageInstruction}\nユーザーが入力した『エピソード』や『感想』が日常的な内容であっても、そこから**『読者のためのノウハウ』『実践的なマインドセット』『共感を呼ぶ価値観』**といった価値提供につながるような、学びや気づきを与える内容に昇華させてください。\n箇条書き、問いかけ形式、短いコラム、またはストーリーテリング形式で、複数のストーリーズ投稿に分けて使えるように構成してください。\n絵文字を効果的に使い、親しみやすさと視認性を高めてください。\n可能であれば、アンケートスタンプ、質問スタンプ、クイズスタンプなどのインタラクティブな要素の活用を促すようなテキスト（例：『みんなはどう思う？』『YES/NOで教えて！』）を含めても良いでしょう。\n最終的な成果物は、連続したストーリーズとして自然に見えるように、一連のテキスト群として提供してください。各テキスト間は、明確に区切るために空行を2行入れてください。`;
    case SNSType.FACEBOOK:
      return "Facebookの投稿として、約200文字から500文字で作成してください。読者のエンゲージメント（いいね！、コメント、シェア）を促すような、親しみやすく価値のある内容にしてください。質問を投げかけたり、コミュニティでの会話が生まれるような工夫もお願いします。動画やイベント告知など、多様なコンテンツ形式を意識した文章も効果的です。";
    case SNSType.LINE:
      return "公式LINEのメッセージとして、最大500文字で作成してください。親しみやすく、簡潔なコミュニケーションを心がけ、読者からの返信や、もしCTAがあればリンクへのクリックを直接的に促すようにしてください。絵文字を効果的に使用して、会話のようなパーソナルな雰囲気を出すのも良いでしょう。リッチメッセージやクーポン配布を想定したテキストも有効です。";
    case SNSType.THREADS:
      return "Threadsの投稿として、最大500文字で作成してください。Instagramのコミュニティと連携しつつ、よりテキストベースでのリアルタイムな会話や意見交換を促す内容が効果的です。飾らない、素直な言葉で、読者との気軽なコミュニケーションを目指しましょう。質問を投げかけたり、ディスカッションのきっかけとなるような一言を添えるのも良いでしょう。関連性の高いキーワードを自然に含めるか、1～2個のハッシュタグを試すことも有効です。他のプラットフォームへの誘導も可能です。";
    default:
      return "適切な長さで文章を作成してください。";
  }
}

export const generateContent = async (
  aiInstance: GoogleGenAI,
  params: GenerationParams
): Promise<{text: string; candidates?: Candidate[]}> => {
  const { author, episode, feelings, tone, snsType, purpose, targetAudience, cta, storyPages } = params;

  const platformInstructions = getPlatformSpecificInstructions(params);
  let snsSpecificGuidance = ""; // Can be expanded if needed

  const systemInstructionString = `あなたはプロのコンテンツクリエイターであり、特に女性起業家のSNSマーケティングを支援することに長けています。
ターゲットプラットフォーム: ${snsType}
${snsType === SNSType.INSTAGRAM_STORIES && storyPages ? `ストーリーズ枚数: ${storyPages}枚` : ''}
トーン: ${tone}
${platformInstructions}
生成する文章には、説明や注釈（例：「提案されたハッシュタグ：」など）を含めず、本文のみを出力してください。
${snsType === SNSType.INSTAGRAM_STORIES ? "ストーリーズの各テキスト間は、明確に区切るために空行を2行入れてください。" : ""}
可能であれば、読者との対話を促す要素（質問、意見募集など）を自然な形で含めてください。
${snsSpecificGuidance}`;

  const userPromptString = `提供情報:
- 投稿者 (視点): ${author || '指定なし'}
- 主なエピソードや出来事 (登場人物の情報もここに含まれる):
${episode || '指定なし'}
- 感想、気づき、伝えたい想い (箇条書きやキーワード):
${feelings || '指定なし'}
${purpose ? `- 投稿の目的: ${purpose}` : ''}
${targetAudience ? `- ターゲット読者: ${targetAudience}` : ''}
${cta && snsType !== SNSType.INSTAGRAM_STORIES ? `- CTA (Call to Action) の指示: ${cta} (このCTAを自然な形で文章に含めてください。CTAの文言そのものを無理に使う必要はなく、意図が伝わるようにしてください。)` : ''}
`;

  try {
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: userPromptString, // User prompt as a string
      config: {
        systemInstruction: systemInstructionString, // System instruction string
        // temperature: 0.7, // Consider adjusting if needed for creativity vs. consistency
        // topP: 0.95,
        // topK: 40,
      }
    });

    // The Candidate type from @google/genai is protos.google.ai.generativelanguage.v1beta.ICandidate
    // Here we cast to our custom Candidate type which only uses groundingMetadata
    const candidates = response.candidates as Candidate[] | undefined;
    return { text: response.text, candidates: candidates };

  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('denied') || error.message.includes('API_KEY_INVALID')) {
             throw new Error("APIキーが無効か、権限がありません。Vercelの環境変数設定などを確認してください。");
        }
        throw new Error(`コンテンツ生成中にエラーが発生しました: ${error.message}`);
    }
    throw new Error("コンテンツ生成中に不明なエラーが発生しました。");
  }
};