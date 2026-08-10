import { useRef, useState } from 'react';
import {
  Expand,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
} from 'lucide-react';
import { Card, IconButton } from '../ui';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function MediaViewer({ title, source }: { title?: string; source?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const hasSource = Boolean(source);

  function togglePlay() {
    const video = videoRef.current;
    if (!video || !hasSource) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function seek(offset: number) {
    const video = videoRef.current;
    if (video && hasSource) video.currentTime = Math.max(0, video.currentTime + offset);
  }

  function toggleFullscreen() {
    const video = videoRef.current;
    if (video && hasSource && video.requestFullscreen) void video.requestFullscreen();
  }

  return (
    <Card className="relative min-h-0 overflow-hidden bg-slate-950 p-0">
      {!hasSource && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-violet-950">
          <div className="text-center text-white/70">
            <Play size={34} className="mx-auto rounded-full bg-white/10 p-2" />
            <p className="mt-2 text-xs">Select a video asset to start watching</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={source}
        className={`absolute inset-0 h-full w-full object-cover ${hasSource ? 'block' : 'hidden'}`}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setCurrentTime(video.currentTime);
          setProgress(video.duration ? video.currentTime / video.duration : 0);
        }}
        onEnded={() => setPlaying(false)}
      />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 text-white">
        <div>{title && <h2 className="text-lg font-bold">{title}</h2>}</div>
        <div className="flex items-center gap-2">
          {hasSource && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary">
              HD
            </span>
          )}
          <IconButton
            label="Expand viewer"
            onClick={toggleFullscreen}
            disabled={!hasSource}
            className="bg-white/10 text-white"
          >
            <Expand size={15} />
          </IconButton>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 text-white">
        <div className="flex items-center gap-2">
          <IconButton
            label={playing ? 'Pause' : 'Play'}
            onClick={togglePlay}
            disabled={!hasSource}
            className="text-white"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton
            label="Skip back 10 seconds"
            onClick={() => seek(-10)}
            disabled={!hasSource}
            className="text-white"
          >
            <RotateCcw size={16} />
          </IconButton>
          <IconButton
            label="Skip forward 10 seconds"
            onClick={() => seek(10)}
            disabled={!hasSource}
            className="text-white"
          >
            <RotateCw size={16} />
          </IconButton>
          <span className="text-[10px] text-white/70">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <input
            aria-label="Media progress"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            disabled={!hasSource}
            onChange={(event) => {
              const value = Number(event.target.value);
              setProgress(value);
              if (videoRef.current?.duration)
                videoRef.current.currentTime = value * videoRef.current.duration;
            }}
            className="h-1 min-w-0 flex-1 accent-violet-400"
          />
          <Volume2 size={15} />
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            disabled={!hasSource}
            onChange={(event) => {
              const value = Number(event.target.value);
              setVolume(value);
              if (videoRef.current) videoRef.current.volume = value;
            }}
            className="hidden w-16 accent-violet-400 sm:block"
          />
          <Settings size={15} className="text-white/70" />
          <button aria-label="Fullscreen" onClick={toggleFullscreen} disabled={!hasSource}>
            <Maximize size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
}
