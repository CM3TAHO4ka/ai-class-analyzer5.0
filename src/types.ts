export type AccuracyLevel = 'low' | 'medium' | 'high';
export type AppPhase = 'setup' | 'loading' | 'ready';
export type EmotionKey = 'happy' | 'sad' | 'angry' | 'surprised' | 'disgusted' | 'fearful' | 'neutral';

export interface DetectedFace {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  emotion: EmotionKey;
  confidence: number;
}

export interface ModelInfo {
  name: string;
  size: string;
  status: 'pending' | 'loading' | 'done';
}

export const EMOTION_MAP: Record<EmotionKey, { label: string; emoji: string; color: string; bgColor: string }> = {
  happy: { label: 'Весёлый', emoji: '😊', color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)' },
  neutral: { label: 'Спокойный', emoji: '😐', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)' },
  sad: { label: 'Грустный', emoji: '😢', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)' },
  angry: { label: 'Злой', emoji: '😠', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' },
  surprised: { label: 'Удивлён', emoji: '😲', color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)' },
  fearful: { label: 'Напряжён', emoji: '😰', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' },
  disgusted: { label: 'Отвращение', emoji: '🤢', color: '#6b7280', bgColor: 'rgba(107,114,128,0.15)' },
};

export const MOOD_GROUPS = {
  happy: { label: 'Весёлый', emoji: '😊', color: '#22c55e', keys: ['happy', 'surprised'] as EmotionKey[] },
  calm: { label: 'Спокойный', emoji: '😐', color: '#f59e0b', keys: ['neutral'] as EmotionKey[] },
  tired: { label: 'Усталый', emoji: '😴', color: '#3b82f6', keys: ['sad', 'disgusted'] as EmotionKey[] },
  tense: { label: 'Напряжённый', emoji: '😰', color: '#ef4444', keys: ['angry', 'fearful'] as EmotionKey[] },
};

export const ACCURACY_OPTIONS: { key: AccuracyLevel; icon: string; label: string; desc: string }[] = [
  { key: 'low', icon: '⚡', label: 'Быстрый', desc: 'Мало ресурсов, ±15%' },
  { key: 'medium', icon: '⚖️', label: 'Баланс', desc: 'Оптимально, ±8%' },
  { key: 'high', icon: '🎯', label: 'Точный', desc: 'Максимум, ±3%' },
];
