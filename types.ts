export interface Track {
  id: string;
  name: string;
  src: string; // URL for file or YouTube Video ID
  type: 'file' | 'youtube';
  gradient: string; // Tailwind gradient classes
  isGenerated?: boolean;
}

export interface TimerState {
  isActive: boolean;
  startTime: number | null;
  totalSeconds: number;
}