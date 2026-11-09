'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Copy, Check, Disc3, Music2, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';

interface TrackResult {
  id: string;
  name: string;
  primaryArtist: string;
  artists: string;
  albumName: string;
  albumCoverUrl: string | null;
  isrc: string | null;
  spotifyUrl: string | null;
  releaseDate?: string;
}

const EXAMPLE_SEARCHES = [
  { song: 'Blinding Lights', artist: 'The Weeknd' },
  { song: 'Shape of You', artist: 'Ed Sheeran' },
  { song: 'Bohemian Rhapsody', artist: 'Queen' },
  { song: 'Levitating', artist: 'Dua Lipa' },
];

export default function HomePage() {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [results, setResults] = useState<TrackResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, customSong?: string, customArtist?: string) => {
    if (e) e.preventDefault();

    const targetSong = (customSong !== undefined ? customSong : songName).trim();
    const targetArtist = (customArtist !== undefined ? customArtist : artistName).trim();

    if (!targetSong) {
      setErrorMessage('Please enter a song name to search.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('song', targetSong);
      if (targetArtist) {
        params.set('artist', targetArtist);
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to search Spotify.');
      }

      setResults(data.tracks || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while searching.';
      setErrorMessage(msg);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyIsrc = async (rawIsrc: string, trackId: string) => {
    // Copy the complete string including the isrc: prefix (e.g., isrc:AUUM71500292)
    const formattedIsrc = rawIsrc.startsWith('isrc:') ? rawIsrc : `isrc:${rawIsrc}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formattedIsrc);
      } else {
        // Fallback for non-secure contexts or legacy browsers
        const textarea = document.createElement('textarea');
        textarea.value = formattedIsrc;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedTrackId(trackId);

      // Revert icon and text after 2 seconds
      setTimeout(() => {
        setCopiedTrackId((prev) => (prev === trackId ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy ISRC code:', err);
    }
  };

  const handlePresetClick = (song: string, artist: string) => {
    setSongName(song);
    setArtistName(artist);
    handleSearch(undefined, song, artist);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-zinc-800 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-zinc-800/25 via-zinc-900/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Main Container: Stacked on mobile/tablet, 2-column grid on desktop (lg:) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:py-12 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          
          {/* Left Column (lg:col-span-5): Header, search inputs, button, quick-try chips */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-8 self-start space-y-6">
            
            {/* Header */}
            <header className="text-left w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium mb-3 tracking-wide">
                <Music2 className="w-3.5 h-3.5 text-zinc-300" />
                <span>Spotify Web API</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                ISRC Finder
              </h1>
              <p className="text-sm text-zinc-400">
                Search any track to instantly retrieve and copy its official International Standard Recording Code.
              </p>
            </header>

            {/* Search Interface */}
            <section className="w-full">
              <form
                onSubmit={(e) => handleSearch(e)}
                className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-2xl flex flex-col gap-3.5 transition-all duration-200 focus-within:border-zinc-700"
              >
                {/* Primary input: Song Name (Required) */}
                <div>
                  <label
                    htmlFor="song-name"
                    className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    Song Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="song-name"
                    type="text"
                    required
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    placeholder="e.g. Blinding Lights"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
                    autoComplete="off"
                  />
                </div>

                {/* Secondary input: Artist Name (Optional) */}
                <div>
                  <label
                    htmlFor="artist-name"
                    className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between"
                  >
                    <span>Artist Name</span>
                    <span className="text-[11px] text-zinc-500 normal-case font-normal">Optional</span>
                  </label>
                  <input
                    id="artist-name"
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. The Weeknd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
                    autoComplete="off"
                  />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={isLoading || !songName.trim()}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-sm cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Searching Spotify...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-black" />
                      <span>Search ISRC</span>
                    </>
                  )}
                </button>
              </form>

              {/* Preset / Sample Pills */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 px-1">
                <span className="text-xs text-zinc-500 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-zinc-500" />
                  Try:
                </span>
                {EXAMPLE_SEARCHES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(item.song, item.artist)}
                    className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 transition-all duration-150 cursor-pointer"
                  >
                    {item.song}
                  </button>
                ))}
              </div>
            </section>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="w-full p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3 text-red-200 text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-300">Search Error</p>
                  <p className="text-xs text-red-400/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (lg:col-span-7): Search results list, scrollable on desktop */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {results !== null ? (
              <div className="w-full animate-slide-up">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Search Results ({results.length})
                  </h2>
                  {results.length > 0 && (
                    <span className="text-xs text-zinc-500">
                      Click copy to copy formatted code
                    </span>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                    <Disc3 className="w-9 h-9 text-zinc-600 mx-auto mb-2.5 animate-pulse" />
                    <p className="text-sm font-medium text-zinc-300">No tracks found</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                      Try checking the spelling or leaving the artist field empty to broaden the search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1.5">
                    {results.map((track) => {
                      const isCopied = copiedTrackId === track.id;
                      const hasIsrc = Boolean(track.isrc);

                      return (
                        <div
                          key={track.id}
                          className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-200 shadow-sm"
                        >
                          {/* Track metadata with cover thumbnail */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Album cover art thumbnail */}
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800/90">
                              {track.albumCoverUrl ? (
                                <Image
                                  src={track.albumCoverUrl}
                                  alt={`${track.albumName} cover`}
                                  fill
                                  sizes="(max-width: 640px) 48px, 56px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Disc3 className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            {/* Song title & Artist info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-semibold text-white truncate group-hover:text-zinc-100">
                                  {track.name}
                                </h3>
                                {track.spotifyUrl && (
                                  <a
                                    href={track.spotifyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open in Spotify"
                                    className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {track.primaryArtist}
                                {track.artists && track.artists !== track.primaryArtist && (
                                  <span className="text-zinc-500 font-normal"> · {track.artists}</span>
                                )}
                              </p>
                              <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                {track.albumName}
                                {track.releaseDate && (
                                  <span> ({track.releaseDate.slice(0, 4)})</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* ISRC Code Display & Copy Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t border-zinc-800/60 sm:border-0">
                            {hasIsrc ? (
                              <>
                                {/* Text Output Format: Strictly follows isrc:[CODE] */}
                                <div className="flex items-center px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs select-all">
                                  <span className="text-zinc-500 font-medium">isrc:</span>
                                  <span className="text-zinc-200 font-semibold tracking-wider ml-0.5">
                                    {track.isrc}
                                  </span>
                                </div>

                                {/* Dedicated Copy Button: Copies complete isrc:[CODE] to clipboard */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyIsrc(track.isrc!, track.id)}
                                  title={`Copy isrc:${track.isrc}`}
                                  aria-label={`Copy ISRC code isrc:${track.isrc}`}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                                    isCopied
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60'
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-zinc-500 italic px-2 py-1">
                                ISRC unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Idle Placeholder for right column before search */
              <div className="hidden lg:flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 min-h-[380px]">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center text-zinc-400 mb-3.5">
                  <Music2 className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-300">Ready to search</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  Enter a song name on the left to look up its official ISRC code. Click any quick preset to see it in action.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer: Centered standard web copyright */}
      <footer className="w-full py-6 border-t border-zinc-900 text-center relative z-10">
        <p className="text-xs text-zinc-500 tracking-wide">
          &copy; 2026 ISRC Finder by DinuruJ. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
