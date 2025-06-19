
import { SelectOption } from './types';

export const TONE_OPTIONS: SelectOption[] = [
  { value: 'casual', label: 'カジュアル' },
  { value: 'formal', label: 'フォーマル' },
  { value: 'friendly', label: '親しみやすい' },
  { value: 'professional', label: '専門的' },
  { value: 'emotional', label: '感動的' },
  { value: 'persuasive', label: '説得力のある' },
];

export const PLATFORM_OPTIONS: SelectOption[] = [
  {
    value: 'ameblo',
    label: 'アメブロ',
    description: 'アメブロ記事 (長文ブログ向け、目安500〜3000字程度)。親しみやすい日記風の投稿や情報発信。絵文字や写真との組み合わせ、読者との交流、SEOも意識したタイトルや構成が鍵。'
  },
  {
    value: 'note',
    label: 'note',
    description: 'note記事 (クリエイター向けプラットフォーム、目安500〜5000字程度)。専門性のある情報、コラム、エッセイなど。読み応えのあるコンテンツ、有料販売も可能なプラットフォーム。独自のファンコミュニティ形成に有効。'
  },
  {
    value: 'instagram',
    label: 'Instagram (フィード投稿)',
    description: 'Instagramフィード投稿キャプション (最大2,200字だが、冒頭数行で惹きつけることが重要)。ビジュアルコンテンツが主役。キャプションは共感を呼ぶストーリー、情報提供、CTAを簡潔に。ハッシュタグ活用（数と質）、リール動画との連携もポイント。'
  },
  {
    value: 'instagram_stories',
    label: 'Instagram ストーリーズ',
    description: 'Instagramストーリーズ (1枚〜5枚構成)。テキスト中心の情報提供。リールへのリーチ基盤構築。ユーザーの課題解決や関心事に特化した専門情報。シンプルな見た目で内容重視。王道のライティング構成（問題提起→導入→内容・解決策）を推奨。'
  },
  {
    value: 'threads',
    label: 'Threads (スレッズ)',
    description: 'Threadsポスト (最大500字)。テキストベースの会話が中心。Instagramとの連携が強み。リアルタイム性の高い情報共有、意見交換、コミュニティ内でのクイックな対話に適している。'
  },
  {
    value: 'x_twitter',
    label: 'X (旧Twitter)',
    description: 'Xポスト (日本語最大140字、プレミアムで長文も可だが短文が基本)。速報性、拡散性が高い。簡潔でインパクトのある情報発信、ハッシュタグ活用（トレンドに乗ることも）、リプライやリポストでの対話・共感が重要。'
  },
  {
    value: 'facebook',
    label: 'Facebook',
    description: 'Facebook投稿 (長文も可能だが、比較的短〜中程度の投稿が多い)。実名制で信頼性が高め。イベント告知、コミュニティ運営、広告配信など多様な用途。幅広い年齢層にリーチ。写真や動画の活用、シェアされやすい投稿が効果的。'
  },
  {
    value: 'official_line',
    label: '公式LINE',
    description: '公式LINEメッセージ (1配信500字以内を3吹き出しまで推奨など、配信ごとの文字数/吹き出し数に注意)。クローズドなコミュニケーション。クーポン配信、パーソナルな情報提供、顧客サポートに最適。開封率が高いが、配信頻度と内容は慎重に。'
  }
];

export const NUMBER_OF_STORIES_OPTIONS: SelectOption[] = [
  { value: '1', label: '1枚' },
  { value: '2', label: '2枚' },
  { value: '3', label: '3枚' },
  { value: '4', label: '4枚' },
  { value: '5', label: '5枚' },
];

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';