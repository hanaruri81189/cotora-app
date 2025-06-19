
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FormData, SelectOption, ChatMessage } from './types';
import { TONE_OPTIONS, PLATFORM_OPTIONS, NUMBER_OF_STORIES_OPTIONS } from './constants';
import FormField from './components/FormField';
import SelectField from './components/SelectField';
import LoadingSpinner from './components/LoadingSpinner';
import ChatInterface from './components/ChatInterface';
import { generateText, refineTextWithInstruction } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

const TARGET_PLATFORMS_FOR_NEWLINE_SPACING = ['instagram', 'instagram_stories', 'threads', 'x_twitter', 'facebook'];

const applyPlatformFormatting = (text: string, platform: string): string => {
  if (TARGET_PLATFORMS_FOR_NEWLINE_SPACING.includes(platform)) {
    const normalizedText = text.replace(/\n[ \t]*/g, '\n');
    return normalizedText.replace(/\n/g, '\n\u200B');
  } else {
    return text.replace(/\n[ \t]+/g, '\n');
  }
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    purpose: '',
    targetAudience: '',
    contentEpisode: '',
    desiredFeeling: '',
    cta: '',
    authorName: '',
    tone: TONE_OPTIONS[0].value,
    platform: PLATFORM_OPTIONS[0].value,
    numberOfStories: 1, // Default for stories
  });

  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedTextCharCount, setGeneratedTextCharCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatformDetails, setSelectedPlatformDetails] = useState<SelectOption | undefined>(
    PLATFORM_OPTIONS.find(opt => opt.value === formData.platform)
  );
  const [copyButtonText, setCopyButtonText] = useState<string>('コピー');
  const [snsCopyButtonText, setSnsCopyButtonText] = useState<string>('SNS用にコピー');

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);

  useEffect(() => {
    setGeneratedTextCharCount(generatedText.length);
  }, [generatedText]);

  useEffect(() => {
    setSelectedPlatformDetails(PLATFORM_OPTIONS.find(opt => opt.value === formData.platform));
    if (generatedText) {
      setGeneratedText(currentText => applyPlatformFormatting(currentText, formData.platform));
    }
     // Reset numberOfStories if platform is not stories, or set default if it is
    if (formData.platform !== 'instagram_stories') {
        setFormData(prev => ({ ...prev, numberOfStories: undefined }));
    } else if (formData.platform === 'instagram_stories' && !formData.numberOfStories) {
        setFormData(prev => ({ ...prev, numberOfStories: 1 }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.platform]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'numberOfStories') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleGeneratedTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedText(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCopyButtonText('コピー');
    setSnsCopyButtonText('SNS用にコピー');
    setChatHistory([]);

    if (!formData.contentEpisode || !formData.desiredFeeling || !formData.tone || !formData.platform) {
      setError('必須項目(*)をすべて入力してください。 (伝えたい内容・エピソード、読者に感じてほしい気持ち、文章のトーン、プラットフォーム)');
      return;
    }
    if (formData.platform === 'instagram_stories' && (!formData.numberOfStories || formData.numberOfStories < 1 || formData.numberOfStories > 5)) {
      setError('ストーリーズの場合は、作成したい枚数を1～5枚で選択してください。');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure numberOfStories is only sent if platform is instagram_stories
      const payload = { ...formData };
      if (payload.platform !== 'instagram_stories') {
        delete payload.numberOfStories;
      } else if (payload.platform === 'instagram_stories' && payload.numberOfStories === undefined) {
        // Ensure a default of 1 if somehow undefined but platform is stories
        payload.numberOfStories = 1;
      }


      const rawResult = await generateText(payload);
      const finalText = applyPlatformFormatting(rawResult, formData.platform);
      setGeneratedText(finalText);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('テキスト生成中に不明なエラーが発生しました。');
      }
      console.error("Error during text generation in App.tsx:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = useCallback(async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopyButtonText('コピーしました！');
      setTimeout(() => setCopyButtonText('コピー'), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      setError('クリップボードへのコピーに失敗しました。手動でコピーしてください。');
      setCopyButtonText('コピー失敗');
      setTimeout(() => setCopyButtonText('コピー'), 3000);
    }
  }, [generatedText]);

  const handleCopyToClipboardForSNS = useCallback(async () => {
    if (!generatedText) return;
    try {
      const formattedText = applyPlatformFormatting(generatedText, formData.platform);
      await navigator.clipboard.writeText(formattedText);
      setSnsCopyButtonText('SNS用にコピーしました！');
      setTimeout(() => setSnsCopyButtonText('SNS用にコピー'), 2000);
    } catch (err) {
      console.error('SNS用コピーに失敗しました:', err);
      setError('SNS用コピーに失敗しました。');
      setSnsCopyButtonText('コピー失敗');
      setTimeout(() => setSnsCopyButtonText('SNS用にコピー'), 3000);
    }
  }, [generatedText, formData.platform]);

  const handleChatInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  }, []);

  const handleSendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !generatedText) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);
    const currentChatInput = chatInput;
    setChatInput('');
    setIsAiReplying(true);
    setError(null);

    try {
      const payload = { ...formData };
      if (payload.platform !== 'instagram_stories') {
        delete payload.numberOfStories;
      } else if (payload.platform === 'instagram_stories' && payload.numberOfStories === undefined) {
         payload.numberOfStories = 1; // Default if somehow lost
      }
      const refinedTextRaw = await refineTextWithInstruction(generatedText, currentChatInput, payload);
      const refinedTextFinal = applyPlatformFormatting(refinedTextRaw, formData.platform);
      setGeneratedText(refinedTextFinal);

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: '指示に基づいて文章を更新しました。上記をご確認ください。',
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, aiMessage]);

    } catch (err) {
      let chatErrorMessage = 'AIによる修正中にエラーが発生しました。';
      if (err instanceof Error) {
        chatErrorMessage = `AI修正エラー: ${err.message}`;
        setError(err.message);
      }
      const aiErrorMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: chatErrorMessage,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, aiErrorMessage]);
      console.error("Error during text refinement in App.tsx:", err);
    } finally {
      setIsAiReplying(false);
    }
  }, [chatInput, generatedText, formData]);


  return (
    <div className="min-h-screen bg-rose-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-pink-600">
          Cotola<sup className="text-xl sm:text-2xl">TM</sup> (コトラ)
        </h1>
        <p className="mt-2 text-lg text-gray-700">プロンプトなしであなたの想いをラクに言葉に</p>
      </header>

      <main className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <FormField
            id="purpose"
            label="投稿の目的"
            value={formData.purpose}
            onChange={handleChange}
            placeholderExample="例: 新商品の認知度向上、イベントへの集客、ブランドへの共感を深める"
            isTextarea
            isOptional
          />
          <FormField
            id="targetAudience"
            label="ターゲット読者"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholderExample="例: 30代の働く女性、子育て中のママ (どんな人に読んでほしいか)"
            isTextarea
            isOptional
          />
          <FormField
            id="contentEpisode"
            label="伝えたい内容・エピソード"
            value={formData.contentEpisode}
            onChange={handleChange}
            placeholderExample="例: 箇条書きやキーワードで入力 (例: 新しいカフェに行った。登場人物: 私、友人A。そこで面白い出来事があった…)"
            isTextarea
            rows={5}
          />
          <FormField
            id="desiredFeeling"
            label="読者に感じてほしい気持ち・考えてほしいこと"
            value={formData.desiredFeeling}
            onChange={handleChange}
            placeholderExample="例: 共感してほしい、勇気を持ってほしい、新しい視点に気づいてほしい"
            isTextarea
            rows={4}
          />
          <FormField
            id="cta"
            label="読者にとってほしい行動 (CTA)"
            value={formData.cta}
            onChange={handleChange}
            placeholderExample="例: 公式LINEに登録、○○プレゼントはこちらから、コメントで教えてね"
            isTextarea
            isOptional
          />
          <FormField
            id="authorName"
            label="投稿者名"
            value={formData.authorName}
            onChange={handleChange}
            placeholderExample="例: コトラ (AIライターアシスタント)、○○サロン代表 花子"
            isOptional
          />

          <div className="flex flex-col sm:flex-row sm:space-x-0 sm:gap-4 mb-6">
            <div className="sm:w-1/2 mb-6 sm:mb-0">
              <SelectField
                id="tone"
                label="文章のトーン"
                value={formData.tone}
                onChange={handleChange}
                options={TONE_OPTIONS}
              />
            </div>
            <div className="sm:w-1/2">
              <SelectField
                id="platform"
                label="プラットフォーム"
                value={formData.platform}
                onChange={handleChange}
                options={PLATFORM_OPTIONS}
                helpText={selectedPlatformDetails?.description}
              />
            </div>
          </div>
          
          {formData.platform === 'instagram_stories' && (
            <div className="mb-6">
              <SelectField
                id="numberOfStories"
                label="ストーリーズの枚数"
                value={String(formData.numberOfStories || 1)}
                onChange={handleChange}
                options={NUMBER_OF_STORIES_OPTIONS}
                helpText="生成したいストーリーズの枚数を選択してください。"
              />
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              <p className="font-bold">エラー</p>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">生成中...</span>
              </>
            ) : (
              <>
                <span className="mr-2 text-xl" aria-hidden="true">★</span> 文章を生成する
              </>
            )}
          </button>
        </form>

        {generatedText && (
          <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-lg shadow">
            <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
              <h3 className="text-xl font-semibold text-pink-700">生成された文章 (編集可能):</h3>
              <div className="flex items-center gap-x-3">
                <span className="text-sm text-gray-700" aria-live="polite">
                  現在の文字数: {generatedTextCharCount} 文字
                </span>
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1.5 text-sm font-medium text-pink-600 bg-pink-100 hover:bg-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors duration-150"
                  aria-label="生成された文章をクリップボードにコピーする"
                >
                  {copyButtonText}
                </button>
                <button
                  type="button"
                  onClick={handleCopyToClipboardForSNS}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors duration-150"
                  aria-label="SNS用にフォーマットしてクリップボードにコピーする"
                >
                  {snsCopyButtonText}
                </button>
              </div>
            </div>
            <textarea
              value={generatedText}
              onChange={handleGeneratedTextChange}
              rows={15}
              className="w-full p-4 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              aria-label="生成された文章（編集可能）"
            />
            <ChatInterface
              chatHistory={chatHistory}
              chatInput={chatInput}
              onChatInputChange={handleChatInputChange}
              onSendMessage={handleSendChatMessage}
              isAiReplying={isAiReplying}
            />
          </div>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Cotola. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;