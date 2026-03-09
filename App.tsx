import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import {
  AccuracyLevel, AppPhase, EmotionKey, DetectedFace, ModelInfo,
  EMOTION_MAP, MOOD_GROUPS, ACCURACY_OPTIONS,
} from './types';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model';

/* ───────────────────────── Setup Screen ───────────────────────── */
function SetupScreen({ onStart }: { onStart: (a: AccuracyLevel) => void }) {
  const [accuracy, setAccuracy] = useState<AccuracyLevel>('high');

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%)' }}>
      <div className="animate-fade-in-up w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🏫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ИИ-Переводчик Эмоций</h1>
          <p className="text-gray-500 text-lg">Анализ настроения класса в реальном времени</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-100">
          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: '🧠', label: 'Нейросеть', sub: 'face-api.js' },
              { icon: '👥', label: 'До 30 лиц', sub: 'одновременно' },
              { icon: '🔒', label: 'Локально', sub: 'приватно' },
            ].map((f) => (
              <div key={f.label} className="text-center p-3 rounded-xl bg-amber-50">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{f.label}</div>
                <div className="text-[10px] text-gray-400">{f.sub}</div>
              </div>
            ))}
          </div>

          {/* Accuracy selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🎯 Точность определения
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCURACY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAccuracy(opt.key)}
                  className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                    accuracy === opt.key
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${opt.key === 'high' ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
                >
                  {opt.key === 'high' && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                      ✅ Рекомендуется
                    </div>
                  )}
                  <div className="text-xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-bold text-gray-700">{opt.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button
            onClick={() => onStart(accuracy)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl
              hover:from-blue-600 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl"
          >
            🚀 Начать работу
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-3">
            ⚠️ Нужен интернет для загрузки моделей (~6 МБ, один раз)
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Loading Screen ───────────────────────── */
function LoadingScreen({ models, progress, error, onRetry }: {
  models: ModelInfo[];
  progress: number;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%)' }}>
      <div className="animate-fade-in-up w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`text-5xl mb-3 ${error ? '' : 'animate-spin-slow'}`} style={{ display: 'inline-block' }}>
              {error ? '❌' : '🧠'}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {error ? 'Ошибка загрузки' : 'Загрузка моделей ИИ'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {error ? 'Проверьте подключение к интернету' : 'Подождите, загружаем нейросети...'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
              <button onClick={onRetry} className="mt-2 w-full py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition">
                🔄 Попробовать снова
              </button>
            </div>
          )}

          {/* Progress bar */}
          {!error && (
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-600">Прогресс</span>
                <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div
                  className="h-full rounded-full striped-bar animate-stripe transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, #3b82f6, #6366f1)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Model list */}
          <div className="space-y-2">
            {models.map((m, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  m.status === 'loading' ? 'bg-blue-50 border border-blue-200' :
                  m.status === 'done' ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="text-lg">
                  {m.status === 'done' ? '✅' : m.status === 'loading' ? '⏳' : '⬜'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-700 truncate">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.size}</div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                  m.status === 'done' ? 'bg-green-100 text-green-600' :
                  m.status === 'loading' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {m.status === 'done' ? 'Готово' : m.status === 'loading' ? 'Загрузка...' : 'Ожидание'}
                </div>
              </div>
            ))}
          </div>

          {/* Step counter */}
          {!error && (
            <div className="text-center text-xs text-gray-400 mt-4">
              Шаг {models.filter(m => m.status === 'done').length + (models.some(m => m.status === 'loading') ? 1 : 0)} из {models.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Dashboard Screen ───────────────────────── */
function DashboardScreen({ accuracy, onAccuracyChange }: { accuracy: AccuracyLevel; onAccuracyChange: (a: AccuracyLevel) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [fps, setFps] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  const getDetectorOptions = useCallback(() => {
    switch (accuracy) {
      case 'low':
        return new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });
      case 'medium':
        return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
      case 'high':
        return new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
    }
  }, [accuracy]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      // Wait for video to actually be ready before setting state
      await new Promise<void>((resolve, reject) => {
        const onPlaying = () => {
          video.removeEventListener('playing', onPlaying);
          video.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          video.removeEventListener('playing', onPlaying);
          video.removeEventListener('error', onError);
          reject(new Error('Видео не удалось воспроизвести'));
        };
        video.addEventListener('playing', onPlaying);
        video.addEventListener('error', onError);

        video.play().catch(reject);
      });

      // Only set cameraOn after video is confirmed playing
      setCameraOn(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setCameraError(`Не удалось включить камеру: ${msg}`);
      // Clean up on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  };

  const stopCamera = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setFaces([]);
    setFps(0);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Detection loop
  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;

    let running = true;

    const detect = async () => {
      if (!running || !videoRef.current || videoRef.current.readyState < 2) {
        if (running) animRef.current = requestAnimationFrame(detect);
        return;
      }

      const options = getDetectorOptions();
      const detections = await faceapi
        .detectAllFaces(videoRef.current, options)
        .withFaceExpressions();

      // FPS
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Map to DetectedFace (limit 30)
      const mapped: DetectedFace[] = detections.slice(0, 30).map((d, i) => {
        const box = d.detection.box;
        const expr = d.expressions;
        const sorted = (Object.entries(expr) as [EmotionKey, number][])
          .sort((a, b) => b[1] - a[1]);
        const topEmotion = sorted[0] || ['neutral', 0.5];
        return {
          id: i + 1,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          emotion: topEmotion[0] as EmotionKey,
          confidence: topEmotion[1],
        };
      });

      setFaces(mapped);
      drawOverlay(mapped);

      if (running) animRef.current = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [cameraOn, getDetectorOptions]);

  const drawOverlay = (faces: DetectedFace[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faces.forEach((face) => {
      const em = EMOTION_MAP[face.emotion];
      const color = em.color;

      // Box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeRect(face.x, face.y, face.width, face.height);
      ctx.shadowBlur = 0;

      // Corner accents
      const cornerLen = Math.min(face.width, face.height) * 0.2;
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      // top-left
      ctx.beginPath(); ctx.moveTo(face.x, face.y + cornerLen); ctx.lineTo(face.x, face.y); ctx.lineTo(face.x + cornerLen, face.y); ctx.stroke();
      // top-right
      ctx.beginPath(); ctx.moveTo(face.x + face.width - cornerLen, face.y); ctx.lineTo(face.x + face.width, face.y); ctx.lineTo(face.x + face.width, face.y + cornerLen); ctx.stroke();
      // bottom-left
      ctx.beginPath(); ctx.moveTo(face.x, face.y + face.height - cornerLen); ctx.lineTo(face.x, face.y + face.height); ctx.lineTo(face.x + cornerLen, face.y + face.height); ctx.stroke();
      // bottom-right
      ctx.beginPath(); ctx.moveTo(face.x + face.width - cornerLen, face.y + face.height); ctx.lineTo(face.x + face.width, face.y + face.height); ctx.lineTo(face.x + face.width, face.y + face.height - cornerLen); ctx.stroke();

      // Label bg
      const label = `${em.emoji} ${Math.round(face.confidence * 100)}%`;
      ctx.font = 'bold 14px sans-serif';
      const textW = ctx.measureText(label).width;
      const labelH = 24;
      const labelY = face.y - labelH - 4;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      roundRect(ctx, face.x, labelY < 0 ? face.y + 2 : labelY, textW + 12, labelH, 6);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label text
      ctx.fillStyle = '#fff';
      ctx.fillText(label, face.x + 6, (labelY < 0 ? face.y + 2 : labelY) + 17);

      // Student number
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      const numLabel = `#${face.id}`;
      const numW = ctx.measureText(numLabel).width;
      roundRect(ctx, face.x + face.width - numW - 10, face.y + face.height + 4, numW + 10, 20, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(numLabel, face.x + face.width - numW - 5, face.y + face.height + 18);
    });
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Class mood
  const classMood = getClassMood(faces);
  const moodDistribution = getMoodDistribution(faces);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏫</span>
            <div>
              <h1 className="text-lg font-bold chalk-text">ИИ-Переводчик Эмоций</h1>
              <p className="text-xs text-green-200">Анализ настроения класса</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {cameraOn && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-green-200">{fps} FPS</span>
                </div>
                <div className="bg-green-700/50 px-3 py-1 rounded-full text-green-100">
                  👥 {faces.length} / 30 лиц
                </div>
              </>
            )}
            <div className="bg-green-700/50 px-3 py-1 rounded-full text-green-100">
              {ACCURACY_OPTIONS.find(o => o.key === accuracy)?.icon} {ACCURACY_OPTIONS.find(o => o.key === accuracy)?.label}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Camera */}
          <div className="lg:w-[60%]">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📹</span>
                  <span className="text-white font-semibold text-sm">Камера</span>
                </div>
                <button
                  onClick={cameraOn ? stopCamera : startCamera}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                    cameraOn
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {cameraOn ? '⏹ Остановить' : '▶️ Включить камеру'}
                </button>
              </div>

              <div className="relative bg-gray-900" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {!cameraOn && !cameraError && !streamRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="text-6xl mb-4 opacity-30">📷</div>
                    <p className="text-lg font-medium">Камера выключена</p>
                    <p className="text-sm mt-1">Нажмите "Включить камеру" для начала</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="bg-red-500/90 backdrop-blur text-white p-4 rounded-xl text-center max-w-sm">
                      <div className="text-3xl mb-2">⚠️</div>
                      <p className="text-sm">{cameraError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Dashboard */}
          <div className="lg:w-[40%] flex flex-col gap-4">
            {/* Class mood */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                🎭 Общее настроение класса
              </h3>
              {faces.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm">Лица не обнаружены</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-2 animate-bounce-in" key={classMood.label}>
                    {classMood.emoji}
                  </div>
                  <div className="text-2xl font-bold" style={{ color: classMood.color }}>
                    {classMood.label}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {faces.length} {pluralFaces(faces.length)} обнаружено
                  </div>
                </div>
              )}
            </div>

            {/* Mood distribution */}
            {faces.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                  📊 Распределение настроений
                </h3>
                {/* Stacked bar */}
                <div className="h-6 rounded-full overflow-hidden flex bg-gray-100 mb-3">
                  {Object.entries(moodDistribution).map(([key, pct]) => {
                    if (pct === 0) return null;
                    const g = MOOD_GROUPS[key as keyof typeof MOOD_GROUPS];
                    return (
                      <div
                        key={key}
                        className="h-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: g.color }}
                        title={`${g.label}: ${Math.round(pct)}%`}
                      />
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(moodDistribution).map(([key, pct]) => {
                    const g = MOOD_GROUPS[key as keyof typeof MOOD_GROUPS];
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                        <span className="text-gray-600">{g.emoji} {g.label}</span>
                        <span className="ml-auto font-bold" style={{ color: g.color }}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Face list */}
            {faces.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100 flex-1">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                  👥 Обнаруженные лица ({faces.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                  {faces.map((face) => {
                    const em = EMOTION_MAP[face.emotion];
                    return (
                      <div
                        key={face.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                        style={{ backgroundColor: em.bgColor }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: em.color }}>
                          {face.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{em.emoji}</span>
                            <span className="text-sm font-semibold text-gray-700">{em.label}</span>
                          </div>
                          <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${face.confidence * 100}%`, backgroundColor: em.color }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-bold" style={{ color: em.color }}>
                          {Math.round(face.confidence * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Accuracy selector */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                ⚙️ Точность определения
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {ACCURACY_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => onAccuracyChange(opt.key)}
                    className={`relative p-2.5 rounded-xl border-2 transition-all text-center ${
                      accuracy === opt.key
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${opt.key === 'high' ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
                  >
                    {opt.key === 'high' && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        ✅ Оптимален
                      </div>
                    )}
                    <div className="text-lg">{opt.icon}</div>
                    <div className="text-[11px] font-bold text-gray-700">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pb-2">
              🔒 Все данные обрабатываются локально в вашем браузере
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Helper functions ───────────────────────── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function pluralFaces(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'лицо';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'лица';
  return 'лиц';
}

function getClassMood(faces: DetectedFace[]) {
  if (faces.length === 0) return { label: 'Нет данных', emoji: '🔍', color: '#9ca3af' };

  const counts = { happy: 0, calm: 0, tired: 0, tense: 0 };
  faces.forEach(f => {
    if (MOOD_GROUPS.happy.keys.includes(f.emotion)) counts.happy++;
    else if (MOOD_GROUPS.calm.keys.includes(f.emotion)) counts.calm++;
    else if (MOOD_GROUPS.tired.keys.includes(f.emotion)) counts.tired++;
    else if (MOOD_GROUPS.tense.keys.includes(f.emotion)) counts.tense++;
  });

  const max = Math.max(counts.happy, counts.calm, counts.tired, counts.tense);
  if (max === 0) return { label: 'Смешанный', emoji: '🎭', color: '#8b5cf6' };

  const dominant = Object.entries(counts).find(([, v]) => v === max)!;
  const ratio = max / faces.length;

  if (ratio < 0.4) return { label: 'Смешанный', emoji: '🎭', color: '#8b5cf6' };

  const group = MOOD_GROUPS[dominant[0] as keyof typeof MOOD_GROUPS];
  return { label: group.label, emoji: group.emoji, color: group.color };
}

function getMoodDistribution(faces: DetectedFace[]) {
  if (faces.length === 0) return { happy: 0, calm: 0, tired: 0, tense: 0 };

  const counts = { happy: 0, calm: 0, tired: 0, tense: 0 };
  faces.forEach(f => {
    if (MOOD_GROUPS.happy.keys.includes(f.emotion)) counts.happy++;
    else if (MOOD_GROUPS.calm.keys.includes(f.emotion)) counts.calm++;
    else if (MOOD_GROUPS.tired.keys.includes(f.emotion)) counts.tired++;
    else if (MOOD_GROUPS.tense.keys.includes(f.emotion)) counts.tense++;
  });

  const total = faces.length;
  return {
    happy: (counts.happy / total) * 100,
    calm: (counts.calm / total) * 100,
    tired: (counts.tired / total) * 100,
    tense: (counts.tense / total) * 100,
  };
}

/* ───────────────────────── Main App ───────────────────────── */
export default function App() {
  const [phase, setPhase] = useState<AppPhase>('setup');
  const [accuracy, setAccuracy] = useState<AccuracyLevel>('high');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([
    { name: 'Компактный детектор лиц', size: '190 КБ', status: 'pending' },
    { name: 'Точный детектор лиц (SSD)', size: '5.4 МБ', status: 'pending' },
    { name: 'Распознавание эмоций', size: '350 КБ', status: 'pending' },
  ]);

  const loadModels = async (acc: AccuracyLevel) => {
    setError(null);
    setProgress(0);
    setModels(prev => prev.map(m => ({ ...m, status: 'pending' as const })));
    setPhase('loading');

    try {
      // Model 1: Tiny face detector
      setModels(prev => prev.map((m, i) => ({ ...m, status: i === 0 ? 'loading' as const : m.status })));
      setProgress(5);
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModels(prev => prev.map((m, i) => ({ ...m, status: i === 0 ? 'done' as const : m.status })));
      setProgress(30);

      // Model 2: SSD MobileNet (only if medium/high)
      setModels(prev => prev.map((m, i) => ({ ...m, status: i === 1 ? 'loading' as const : m.status })));
      setProgress(35);
      if (acc === 'high') {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      } else {
        // Simulated short wait — model not needed
        await new Promise(r => setTimeout(r, 300));
      }
      setModels(prev => prev.map((m, i) => ({
        ...m,
        status: i === 1 ? 'done' as const : m.status,
        name: i === 1 && acc !== 'high' ? 'Точный детектор (пропущен)' : m.name,
        size: i === 1 && acc !== 'high' ? 'не нужен' : m.size,
      })));
      setProgress(75);

      // Model 3: Face expressions
      setModels(prev => prev.map((m, i) => ({ ...m, status: i === 2 ? 'loading' as const : m.status })));
      setProgress(80);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModels(prev => prev.map((m, i) => ({ ...m, status: i === 2 ? 'done' as const : m.status })));
      setProgress(100);

      // Small delay for UX
      await new Promise(r => setTimeout(r, 500));
      setPhase('ready');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка загрузки: ${msg}`);
    }
  };

  const handleStart = (acc: AccuracyLevel) => {
    setAccuracy(acc);
    loadModels(acc);
  };

  const handleRetry = () => {
    loadModels(accuracy);
  };

  if (phase === 'setup') return <SetupScreen onStart={handleStart} />;
  if (phase === 'loading') return <LoadingScreen models={models} progress={progress} error={error} onRetry={handleRetry} />;
  return <DashboardScreen accuracy={accuracy} onAccuracyChange={setAccuracy} />;
}
