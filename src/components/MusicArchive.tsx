import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Disc, Play, Pause, Volume2 } from 'lucide-react';

interface TrackItem {
  id: string;
  num: string;
  title: string;
  artist: string;
  tag: string;
  duration: string;
}

const TRACKS: TrackItem[] = [
  {
    id: '1',
    num: '01',
    title: 'Neural Codex',
    artist: 'Synthesizer V',
    tag: 'Cyberpunk Ambient',
    duration: '3:45',
  },
  {
    id: '2',
    num: '02',
    title: 'Latent Space Odyssey',
    artist: 'Kokoro Echoes',
    tag: 'Lo-Fi Synth',
    duration: '4:12',
  },
  {
    id: '3',
    num: '03',
    title: 'TensorFlow Drift',
    artist: 'GPU Cluster',
    tag: 'Dark Techno',
    duration: '5:04',
  },
  {
    id: '4',
    num: '04',
    title: 'Zero Human Intervention',
    artist: 'Agentic Flow',
    tag: 'Drone / Chill',
    duration: '2:58',
  },
];

/**
 * Curated music archive section showcasing sonic frequencies and ambient coding playlists.
 */
export function MusicArchive(): React.JSX.Element {
  const [activeTrack, setActiveTrack] = useState<string | null>('1');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  /**
   * Toggles active state and simulated playback for a selected track.
   */
  const toggleTrack = (id: string): void => {
    if (activeTrack === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(id);
      setIsPlaying(true);
    }
  };

  return (
    <section
      id="music-archive"
      className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-[#EAECE9] relative z-10 bg-white lg:bg-transparent"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4D6D47] mb-3">
          <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
          <span>Sonic Curation</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-black uppercase mb-3">
          Music Archive
        </h2>
        <p className="text-base sm:text-lg text-neutral-500 max-w-xl font-normal mb-12">
          Curated sonic frequencies and ambient soundscapes powering autonomous multi-agent code
          generation sessions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRACKS.map((trk) => {
            const isActive = activeTrack === trk.id;
            return (
              <motion.div
                key={trk.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleTrack(trk.id)}
                className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-[#1C2E1E] text-white border-[#1C2E1E] shadow-xl shadow-emerald-950/10'
                    : 'bg-white text-black border-[#EAECE9] hover:border-[#CCCCCC]'
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <span
                    className={`font-mono text-sm sm:text-base shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-neutral-400'
                    }`}
                  >
                    {trk.num}
                  </span>

                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-current/20">
                    {isActive && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>

                  <div className="min-w-0 truncate">
                    <h3 className="font-medium text-base sm:text-lg truncate tracking-tight">
                      {trk.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm truncate ${
                        isActive ? 'text-emerald-200/80' : 'text-neutral-500'
                      }`}
                    >
                      {trk.artist} &middot; <span className="italic">{trk.tag}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-4 shrink-0">
                  {isActive && isPlaying && (
                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse hidden sm:block" />
                  )}
                  <span
                    className={`font-mono text-xs sm:text-sm ${
                      isActive ? 'text-emerald-300' : 'text-neutral-400'
                    }`}
                  >
                    {trk.duration}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
