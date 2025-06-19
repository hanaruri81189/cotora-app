import React, { useState, useCallback, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
// Removed: import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { GenerationParams, SNSType, Tone, GroundingChunk, Candidate } from './types';
import { TONE_OPTIONS, SNS_OPTIONS, SNS_MAX_CHARS } from './constants';
// Removed: import { generateContent as callGeminiApi } from './services/geminiService'; // No longer calling service directly from frontend

// --- Icon Components (no change) ---
const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.382c-.836.067-1.171 1.025-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.626.300-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
  </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25h0a8.25 8.25 0 01-8.25-8.25v0A8.25 8.25 0 014.5 2.25H8.25m8.25 8.25v0a8.25 8.25 0 01-8.25 8.25h0a8.25 8.25 0 01-8.25-8.25v0a8.25 8.25 0 018.25-8.25h0M12 4.875v10.5M12 4.875c-1.036 0-1.875.84-1.875 1.875v.375c0 1.036.84 1.875 1.875 1.875h0c1.035 0 1.875-.84 1.875-1.875v-.375C13.875 5.715 13.035 4.875 12 4.875z" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M3.105 3.105a1.5 1.5 0 012.122-.001L18.42 14.22a1.5 1.5 0 01.001 2.122l-.707.707a1.5 1.5 0 01-2.122-.001L3.105 5.228a1.5 1.5 0 01-.001-2.122z" />
    <path d="M14.927 15.005a1.5 1.5 0 011.414-1.414l2.122 2.121a1.5 1.5 0 01-1.414 1.415l-2.121-2.122zM3.808 4.495l10.42 10.42a.75.75 0 001.06-1.06L4.868 3.435a.75.75 0 00-1.06 1.06z" />
  </svg>
);

// --- UI Helper Components (no change) ---
interface InputFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  ['aria-describedby']?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, value, onChange, placeholder, type = "text", ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
      aria-required={label.includes('*')}
      {...props}
    />
  </div>
);

interface TextareaFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  ['aria-describedby']?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, id, value, onChange, placeholder, rows = 3, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
      aria-required={label.includes('*')}
      {...props}
    />
  </div>
);

interface SelectFieldProps<T extends string | number> {
  label: string;
  id: string;
  value: T;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: T; label: string }[];
  ['aria-describedby']?: string;
}

const SelectField = <T extends string | number,>({ label, id, value, onChange, options, ...props }: SelectFieldProps<T>): React.ReactNode => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors bg-white"
      aria-required={label.includes('*')}
      {...props}
    >
      {options.map(option => (
        <option key={option.value.toString()} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  ['aria-label']?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, type = "button", disabled = false, children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out";
  const variantStyles = variant === 'primary'
    ? "text-white bg-rose-500 hover:bg-rose-600 focus:ring-rose-400 disabled:bg-rose-300"
    : "text-rose-700 bg-rose-100 hover:bg-rose-200 focus:ring-rose-500 disabled:bg-gray-200";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Loading Component (no change) ---
const ThinkingCatLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center my-4" aria-live="polite" aria-label="考え中">
    <img
      src="/cotola-chan-thinking.png"
      alt="考え中のコトラちゃん"
      className="w-32 h-auto mb-3"
      onError={(e) => {
        const imgElement = e.target as HTMLImageElement;
        imgElement.style.display = 'none';
        const fallbackText = document.createElement('p');
        fallbackText.textContent = '画像ロードエラー';
        if (imgElement.parentNode) {
            imgElement.parentNode.insertBefore(fallbackText, imgElement.nextSibling);
        }
      }}
    />
    <p className="text-rose-600 font-semibold text-lg animate-pulse">考え中・・・</p>
  </div>
);

// --- Helper functions for text formatting (no change) ---
const BRAILLE_BLANK = '\u2800';

const formatTextForInstagramFacebook = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\n\s*\n\s*\n/g, `\n${BRAILLE_BLANK}\n${BRAILLE_BLANK}\n`) 
    .replace(/\n\s*\n/g, `\n${BRAILLE_BLANK}\n`); 
};

const unformatTextFromInstagramFacebook = (text: string): string => {
  if (!text) return '';
  let cleanedText = text.replace(new RegExp(`\n${BRAILLE_BLANK}\n${BRAILLE_BLANK}\n`, 'g'), '\n\n\n');
  cleanedText = cleanedText.replace(new RegExp(`\n${BRAILLE_BLANK}\n`, 'g'), '\n\n');
  cleanedText = cleanedText.replace(new RegExp(`\n${BRAILLE_BLANK}`, 'g'), '\n'); 
  return cleanedText;
};


// --- Main App Component ---
const App: React.FC = () => {
  const [author, setAuthor] = useState<string>('');
  const [episode, setEpisode] = useState<string>('');
  const [feelings, setFeelings] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [cta, setCta] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.CASUAL);
  const [selectedSnsType, setSelectedSnsType] = useState<SNSType>(SNSType.AMEBLO);
  const [storyPages, setStoryPages] = useState<number>(3);
  const [platformDescription, setPlatformDescription] = useState<string>('');

  const [generatedText, setGeneratedText] = useState<string>('');
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const [chatInstruction, setChatInstruction] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // API Key initialization is removed from frontend. It's handled by backend.
  // useEffect for API key initialization is removed.


  useEffect(() => {
    switch (selectedSnsType) {
      case SNSType.AMEBLO:
        setPlatformDescription("アメブロ: 親しみやすい日記風の投稿や情報発信。絵文字や写真との組み合わせ、読者との交流が鍵。");
        break;
      case SNSType.NOTE:
        setPlatformDescription("note: 専門知識や体験談など、読み応えのあるコンテンツ発信。クリエイターエコノミーのプラットフォーム。");
        break;
      case SNSType.X:
        setPlatformDescription("X (旧Twitter): 短文でのリアルタイムな情報発信・拡散。エンゲージメントを意識した工夫が重要。最大140字。");
        break;
      case SNSType.INSTAGRAM:
        setPlatformDescription("Instagram キャプション: ビジュアル重視のフィード投稿。リール動画の効果大。ストーリーズでの日常発信やキャプションでの補足も大切。");
        break;
      case SNSType.INSTAGRAM_STORIES:
        setPlatformDescription("Instagram ストーリーズ: 価値提供重視。日常エピソードからノウハウ・マインド・価値観に繋げる短いテキスト群。複数枚投稿を想定。下のオプションで枚数を選択できます。");
        break;
      case SNSType.FACEBOOK:
        setPlatformDescription("Facebook: 幅広い層にリーチ可能。コミュニティ機能や動画コンテンツ、イベント告知などが有効。");
        break;
      case SNSType.LINE:
        setPlatformDescription("公式LINE: 友だち登録者へのダイレクトなメッセージ配信。高い開封率を活かした顧客育成や販促。最大500字。");
        break;
      case SNSType.THREADS:
        setPlatformDescription("Threads: Instagram連携のテキスト中心SNS。リアルタイムな会話や意見交換、フォロワーとの気軽な交流に。最大500字。");
        break;
      default:
        setPlatformDescription('');
    }
  }, [selectedSnsType]);

  useEffect(() => {
    setGeneratedText(currentGeneratedText => {
      if (!currentGeneratedText) return '';
      let textToUpdate = unformatTextFromInstagramFacebook(currentGeneratedText);
      if (selectedSnsType === SNSType.INSTAGRAM || selectedSnsType === SNSType.FACEBOOK) {
        textToUpdate = formatTextForInstagramFacebook(textToUpdate);
      }
      return textToUpdate;
    });
  }, [selectedSnsType]);


  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedText('');
    setGroundingChunks([]); // Clear previous grounding chunks
    setCopySuccess('');

    if (!episode.trim() || !feelings.trim()) {
      setError("「伝えたい内容・エピソード」と「読者に感じてほしい気持ち・考えてほしいこと」は必須項目です。");
      setIsLoading(false);
      return;
    }

    const params: GenerationParams = {
      author, episode, feelings, purpose, targetAudience, cta,
      tone: selectedTone, snsType: selectedSnsType,
      storyPages: selectedSnsType === SNSType.INSTAGRAM_STORIES ? storyPages : undefined,
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use error message from backend if available, otherwise a generic one
        throw new Error(result.error || `サーバーエラー (${response.status})`);
      }
      
      let finalText = result.text;
      if (selectedSnsType === SNSType.INSTAGRAM || selectedSnsType === SNSType.FACEBOOK) {
        finalText = formatTextForInstagramFacebook(finalText);
      }
      setGeneratedText(finalText);
      // Handle grounding chunks if backend provides them
      if (result.candidates && result.candidates[0]?.groundingMetadata?.groundingChunks) {
        setGroundingChunks(result.candidates[0].groundingMetadata.groundingChunks);
      } else {
        setGroundingChunks([]); // Ensure it's cleared if not present
      }

    } catch (err) {
      console.error("Error in handleSubmit calling /api/generate:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("予期せぬエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  }, [author, episode, feelings, purpose, targetAudience, cta, selectedTone, selectedSnsType, storyPages]);

  const handleChatSubmit = useCallback(async () => {
    if (!chatInstruction.trim() || !generatedText.trim()) {
      setError("追加の指示を入力するか、元の文章が生成されていることを確認してください。");
      return;
    }

    setIsChatLoading(true);
    setError(null);
    setCopySuccess('');

    try {
        const unformattedOriginalText = (selectedSnsType === SNSType.INSTAGRAM || selectedSnsType === SNSType.FACEBOOK)
                                        ? unformatTextFromInstagramFacebook(generatedText)
                                        : generatedText;
        
        const payload = {
            currentText: unformattedOriginalText,
            chatInstruction: chatInstruction,
            selectedSnsType: selectedSnsType, // Pass SNS type for context
            storyPages: selectedSnsType === SNSType.INSTAGRAM_STORIES ? storyPages : undefined, // Pass story pages if applicable
        };

        const response = await fetch('/api/refine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `サーバーエラー (${response.status})`);
        }

        let newText = result.text;
        if (selectedSnsType === SNSType.INSTAGRAM || selectedSnsType === SNSType.FACEBOOK) {
            newText = formatTextForInstagramFacebook(newText);
        }
        setGeneratedText(newText);
        setChatInstruction(''); // Clear chat input after successful submission

    } catch (err) {
        console.error("Error in handleChatSubmit calling /api/refine:", err);
        if (err instanceof Error) {
            setError(`チャットでの処理中にエラーが発生しました: ${err.message}`);
        } else {
            setError("チャットでの処理中に予期せぬエラーが発生しました。");
        }
    } finally {
        setIsChatLoading(false);
    }
  }, [chatInstruction, generatedText, selectedSnsType, storyPages]);


  const handleGeneratedTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedText(e.target.value);
  };

  const handleCopyText = useCallback(() => {
    if (!generatedText) return;
    let textToCopy = generatedText;
    if (selectedSnsType === SNSType.INSTAGRAM || selectedSnsType === SNSType.FACEBOOK) {
        textToCopy = unformatTextFromInstagramFacebook(generatedText);
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess("コピーしました！");
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        setCopySuccess("コピーに失敗しました。");
        setTimeout(() => setCopySuccess(''), 2000);
      });
  }, [generatedText, selectedSnsType]);

  const getCurrentCharCount = () => {
    if (!generatedText) return 0;
    if (selectedSnsType === SNSType.INSTAGRAM || selectedSnsType === SNSType.FACEBOOK) {
      return unformatTextFromInstagramFacebook(generatedText).length;
    }
    return generatedText.length;
  };

  const storyPageOptions = [1, 2, 3, 4, 5].map(num => ({ value: num, label: `${num}枚` }));

  const charCount = getCurrentCharCount();
  const maxChars = SNS_MAX_CHARS[selectedSnsType];

  return (
    <div className="min-h-screen bg-rose-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center" aria-labelledby="app-title">
          <h1
            id="app-title"
            className="text-4xl font-extrabold text-rose-700 sm:text-5xl flex items-center justify-center font-['M_PLUS_Rounded_1c']"
          >
            Cotola™ (コトラ)
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            プロンプトなしであなたの想いをラクに言葉に
          </p>
        </header>

        {(isLoading || isChatLoading) && <ThinkingCatLoader />}

        {!isLoading && !isChatLoading && (
          <form key={selectedSnsType} onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 ring-1 ring-gray-200" aria-labelledby="form-heading">
            <h2 id="form-heading" className="sr-only">コンテンツ生成フォーム</h2>

            <TextareaField
              label="投稿の目的 (任意)"
              id="purpose"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="例: 新商品の認知度向上、イベントへの集客、ブランドへの共感を深める"
              rows={2}
              aria-describedby="purpose-description"
            />
            <p id="purpose-description" className="sr-only">この投稿で達成したい目的を入力します。</p>

            <TextareaField
              label="ターゲット読者 (任意)"
              id="targetAudience"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="例: 30代の働く女性、子育て中のママ (どんな人に読んでほしいか)"
              rows={2}
              aria-describedby="targetAudience-description"
            />
            <p id="targetAudience-description" className="sr-only">この投稿を届けたい相手について入力します。</p>

            <TextareaField
              label="伝えたい内容・エピソード* (出来事、背景、登場人物など)"
              id="episode"
              value={episode}
              onChange={e => setEpisode(e.target.value)}
              placeholder="箇条書きやキーワードで入力 (例: 新しいカフェに行った。登場人物: 私、友人A。そこで面白い出来事があった...)"
              rows={4}
              aria-describedby="episode-description"
            />
            <p id="episode-description" className="sr-only">コンテンツの中心となるエピソードや出来事、背景、登場人物などを入力してください。この項目は必須です。</p>
            
            <TextareaField
              label="読者に感じてほしい気持ち・考えてほしいこと*"
              id="feelings"
              value={feelings}
              onChange={e => setFeelings(e.target.value)}
              placeholder="例：共感してほしい、勇気を持ってほしい、新しい視点に気づいてほしい"
              rows={4}
              aria-describedby="feelings-description"
            />
            <p id="feelings-description" className="sr-only">読者にどのような気持ちになってほしいか、あるいは何を考えてほしいかを入力してください。この項目は必須です。</p>

            <TextareaField
              label="読者にとってほしい行動 (CTA) (任意)"
              id="cta"
              value={cta}
              onChange={e => setCta(e.target.value)}
              placeholder="例: 公式LINEに登録、〇〇プレゼントはこちらから、コメントで教えてね"
              rows={2}
              aria-describedby="cta-description cta-notes"
            />
             <p id="cta-notes" className={`text-xs text-gray-500 mt-1 ${selectedSnsType === SNSType.INSTAGRAM_STORIES ? 'visible' : 'sr-only'}`}>
              Instagramストーリーズでは、CTAはスタンプ等で行うことを推奨するため、ここでの入力は反映されにくい場合があります。
            </p>

            <InputField
              label="投稿者名 (任意)"
              id="author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="例: コトラ (AIライターアシスタント), 〇〇サロン代表 花子"
              aria-describedby="author-description"
            />
            <p id="author-description" className="sr-only">コンテンツの著者または視点となる名前を入力します。肩書きを含めると、よりパーソナライズされた文章が生成されやすくなります。</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SelectField<Tone>
                  label="文章のトーン*"
                  id="tone"
                  value={selectedTone}
                  onChange={e => setSelectedTone(e.target.value as Tone)}
                  options={TONE_OPTIONS}
                  aria-describedby="tone-description"
                />
                <p id="tone-description" className="sr-only">生成される文章の雰囲気をリストから選択してください。</p>
              </div>
              <div>
                <SelectField<SNSType>
                  label="プラットフォーム*"
                  id="snsType"
                  value={selectedSnsType}
                  onChange={e => {
                    setSelectedSnsType(e.target.value as SNSType);
                  }}
                  options={SNS_OPTIONS}
                  aria-describedby="snsType-description platform-specific-description"
                />
                <p id="snsType-description" className="sr-only">コンテンツを投稿するSNSプラットフォームをリストから選択してください。</p>
                {platformDescription && (
                  <p className="mt-2 text-xs text-gray-500" id="platform-specific-description">
                    {platformDescription}
                  </p>
                )}
              </div>
            </div>

            {selectedSnsType === SNSType.INSTAGRAM_STORIES && (
              <div>
                <SelectField<number>
                  label="ストーリーズの枚数*"
                  id="storyPages"
                  value={storyPages}
                  onChange={e => setStoryPages(parseInt(e.target.value, 10))}
                  options={storyPageOptions}
                  aria-describedby="story-pages-description"
                />
                <p id="story-pages-description" className="mt-1 text-xs text-gray-500">選択した枚数に合わせて文章量や構成が調整されます。</p>
              </div>
            )}


            <Button type="submit" disabled={isLoading || !episode.trim() || !feelings.trim()} className="w-full text-lg py-3" aria-label={isLoading ? '文章を生成中' : '文章を生成する'}>
              <SparklesIcon className="w-5 h-5 mr-2" aria-hidden="true" />
              文章を生成する
            </Button>
          </form>
        )}

        {error && (
          <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
            <p className="font-bold">エラーが発生しました</p>
            <p>{error}</p>
          </div>
        )}

        {generatedText && !isLoading && !isChatLoading && (
          <section className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200" aria-labelledby="generated-content-heading">
            <div className="flex justify-between items-center mb-4">
              <h2 id="generated-content-heading" className="text-2xl font-semibold text-rose-700">生成された文章</h2>
              <Button onClick={handleCopyText} variant="secondary" disabled={!generatedText} aria-label="生成された文章をクリップボードにコピーする">
                <ClipboardIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                コピー
              </Button>
            </div>
            {copySuccess && <p className="text-sm text-green-600 mb-2 transition-opacity duration-300" role="status">{copySuccess}</p>}
            <textarea
              ref={textareaRef}
              id="generated-content-area"
              aria-labelledby="generated-content-heading"
              className="w-full p-4 bg-gray-50 rounded-md border border-gray-200 min-h-[150px] max-h-[400px] sm:text-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 transition-colors resize-y overflow-y-auto"
              value={generatedText}
              onChange={handleGeneratedTextChange}
              rows={10}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              現在の文字数: {charCount}{maxChars && selectedSnsType !== SNSType.INSTAGRAM_STORIES ? ` / ${maxChars}` : ''}字
              {selectedSnsType === SNSType.INSTAGRAM_STORIES && ` (${storyPages}枚構成)`}
            </div>


            {groundingChunks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600">参照元情報 (Google検索利用時):</h3>
                <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
                  {groundingChunks.map((chunk, index) =>
                    chunk.web && chunk.web.uri && ( 
                      <li key={index}>
                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-800 underline">
                          {chunk.web.title || chunk.web.uri}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">さらに指示して調整する</h3>
              <TextareaField
                label="追加の指示を入力してください"
                id="chatInstruction"
                value={chatInstruction}
                onChange={(e) => setChatInstruction(e.target.value)}
                placeholder="例: もっと短くして、この部分を強調して、絵文字を増やして"
                rows={3}
                aria-describedby="chat-instruction-description"
              />
              <p id="chat-instruction-description" className="sr-only">生成された文章に対して、さらに改善するための指示を入力します。</p>
              <Button
                onClick={handleChatSubmit}
                disabled={isChatLoading || !chatInstruction.trim() || !generatedText.trim()}
                className="mt-3 w-full sm:w-auto"
                aria-label={isChatLoading ? '指示を反映中' : '指示を反映して再生成'}
              >
                <SendIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                {isChatLoading ? '反映中...' : '指示を反映して再生成'}
              </Button>
            </div>
          </section>
        )}
      </div>
       <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} hanaruri. Powered by Gemini API & Vercel.</p>
        <p className="text-xs mt-1">
          Cat illustration source: Image provided by the user. Please ensure you have the rights to use this image.
        </p>
      </footer>
    </div>
  );
};

export default App;