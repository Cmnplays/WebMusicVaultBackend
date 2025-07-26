import React, { useState, useRef, useEffect } from "react";
import { fetchAllSongs } from "../services/song.services";
import type { Song } from "../services/song.services";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

const MusicPage: React.FC = () => {
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMoreSongs, setHasMoreSongs] = useState(true);
  const [loading, setLoading] = useState(false);
  const Limit = 10;

  // Fetch songs on page or initial load
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      try {
        const newSongs = await fetchAllSongs(Limit, page);

        setSongs((prev) => {
          const combined = [...prev, ...newSongs];
          const uniqueSongsMap = new Map<string, Song>();
          combined.forEach((song) => uniqueSongsMap.set(song._id, song));
          return Array.from(uniqueSongsMap.values());
        });

        if (newSongs.length < Limit) {
          setHasMoreSongs(false);
        }
      } catch (error) {
        console.error("Failed to load songs", error);
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, [page]);

  // Play or pause audio based on playingSong change
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (playingSong?.fileUrl) {
      if (audioEl.src !== playingSong.fileUrl) {
        audioEl.src = playingSong.fileUrl;
      }
      audioEl.currentTime = 0;
      audioEl.play().catch((err) => console.error("Audio play error", err));
    } else {
      audioEl.pause();
      audioEl.src = "";
    }
  }, [playingSong]);

  // Infinite scroll: load more songs when near bottom
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (loading || !hasMoreSongs) return;

      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const bottomPosition = document.documentElement.offsetHeight;

        if (bottomPosition - scrollPosition < 150) {
          setPage((prev) => prev + 1);
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [loading, hasMoreSongs]);

  // Handle play button click
  function handlePlayClick(song: Song) {
    if (playingSong?._id === song._id) {
      setPlayingSong(null);
    } else {
      if (!song.fileUrl) {
        alert("Audio not available for this song.");
        return;
      }
      setPlayingSong(song);
    }
  }

  // New: Handle when current song ends, play next if available
  function handleAudioEnded() {
    if (!playingSong) return;

    const currentIndex = songs.findIndex((s) => s._id === playingSong._id);
    if (currentIndex === -1) {
      setPlayingSong(null);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      setPlayingSong(songs[nextIndex]);
    } else {
      // No more songs in list
      setPlayingSong(null);
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">
        Your Music Collection
      </h2>

      <ul className="space-y-4">
        {songs.map((song) => {
          const isPlaying = playingSong?._id === song._id;

          return (
            <li
              key={song._id}
              className="flex items-center gap-4 p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <button
                onClick={() => handlePlayClick(song)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow focus:outline-none
                  ${
                    isPlaying
                      ? "bg-gradient-to-tr from-purple-700 to-purple-900"
                      : "bg-gradient-to-tr from-blue-400 to-purple-600"
                  }
                `}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
                  </svg>
                )}
              </button>

              <div className="flex-grow overflow-hidden">
                <h3
                  className="text-lg font-semibold text-gray-900 truncate"
                  title={song.title}
                >
                  {song.title}
                </h3>
              </div>

              <div className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-mono font-semibold px-2 py-0.5 rounded-full select-none">
                {formatDuration(song.duration)}
              </div>
            </li>
          );
        })}
      </ul>

      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        preload="metadata"
        hidden
      />

      {loading && (
        <p className="text-center mt-4 text-gray-600">Loading more songs...</p>
      )}
      {!hasMoreSongs && (
        <p className="text-center mt-4 text-gray-600">
          You have reached the end of the list.
        </p>
      )}
    </main>
  );
};

export default MusicPage;
