
import { Tone, SNSType } from './types';

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: Tone.CASUAL, label: 'カジュアル' },
  { value: Tone.FORMAL, label: 'フォーマル' },
  { value: Tone.ENTHUSIASTIC, label: '熱狂的' },
  { value: Tone.HUMOROUS, label: 'ユーモラス' },
  { value: Tone.PERSUASIVE, label: '説得力のある' },
  { value: Tone.INFORMATIVE, label: '情報を提供する' },
  { value: Tone.FRIENDLY, label: '親しみやすい' },
];

export const SNS_OPTIONS: { value: SNSType; label: string }[] = [
  { value: SNSType.AMEBLO, label: 'アメブロ記事 (500～1500字目安)' },
  { value: SNSType.NOTE, label: 'note記事 (800～2000字目安)' },
  { value: SNSType.X, label: 'X (旧Twitter) ツイート (最大140字)' },
  { value: SNSType.INSTAGRAM, label: 'Instagram キャプション (300～500字目安)' },
  { value: SNSType.INSTAGRAM_STORIES, label: 'Instagram ストーリーズ (価値提供重視)' },
  { value: SNSType.FACEBOOK, label: 'Facebook 投稿 (200～500字目安)' },
  { value: SNSType.LINE, label: '公式LINE (最大500字)' },
  { value: SNSType.THREADS, label: 'Threads (スレッズ) (最大500字)' },
];

export const SNS_MAX_CHARS: Partial<Record<SNSType, number>> = {
  [SNSType.X]: 140,
  [SNSType.LINE]: 500,
  [SNSType.THREADS]: 500,
  // INSTAGRAM_STORIES は1投稿あたりの文字数が流動的なため、ここでは定義しない
};