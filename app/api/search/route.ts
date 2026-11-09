import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrackItem {
  id: string;
  name: string;
  external_ids?: {
    isrc?: string;
  };
  artists?: Array<{
    name: string;
  }>;
  album?: {
    name: string;
    images?: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date?: string;
  };
  external_urls?: {
    spotify?: string;
  };
  duration_ms?: number;
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrackItem[];
    total: number;
  };
  error?: {
    status: number;
    message: string;
  };
}

export interface TrackResult {
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

export const dynamic = 'force-dynamic';

// In-memory token cache to prevent repeated token requests
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Retrieves a valid Spotify Client Credentials access token.
 * Caches token in memory until expiration (with a 60s safety buffer).
 */
async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API credentials are not configured in environment variables.');
  }

  // Return cached token if valid
  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    throw new Error(`Failed to obtain Spotify token (${tokenRes.status}): ${errorBody}`);
  }

  const tokenData: SpotifyTokenResponse = await tokenRes.json();
  cachedAccessToken = tokenData.access_token;
  // Expire 60 seconds before actual expiration time for safety
  tokenExpiresAt = Date.now() + Math.max(0, (tokenData.expires_in - 60) * 1000);

  return cachedAccessToken;
}

/**
 * Executes a Spotify track search for the given query.
 */
async function querySpotify(query: string, token: string, limit = 5): Promise<SpotifyTrackItem[]> {
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('type', 'track');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('q', query);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.status === 401) {
    // Invalidate cached token on 401
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    throw new Error('Spotify token expired or invalid');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Spotify search API error (${res.status}): ${errText}`);
  }

  const data: SpotifySearchResponse = await res.json();
  return data.tracks?.items || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const songName = (searchParams.get('song') || searchParams.get('track') || searchParams.get('q') || '').trim();
    const artistName = (searchParams.get('artist') || '').trim();

    if (!songName) {
      return NextResponse.json(
        { error: 'Song name is required.' },
        { status: 400 }
      );
    }

    let token = await getSpotifyAccessToken();

    // Construct primary search query: q=track:{song_name} artist:{artist_name}
    let query = `track:${songName}`;
    if (artistName) {
      query += ` artist:${artistName}`;
    }

    let items: SpotifyTrackItem[] = [];

    try {
      items = await querySpotify(query, token, 5);
    } catch (err: unknown) {
      // If unauthorized, retry once with fresh token
      const message = err instanceof Error ? err.message : '';
      if (message.includes('expired or invalid')) {
        token = await getSpotifyAccessToken();
        items = await querySpotify(query, token, 5);
      } else {
        throw err;
      }
    }

    // Fallback: If strict field query returns 0 items and artist was provided,
    // try relaxed natural search query: "{songName} {artistName}"
    if (items.length === 0 && artistName) {
      try {
        const fallbackQuery = `${songName} ${artistName}`;
        items = await querySpotify(fallbackQuery, token, 5);
      } catch {
        // Ignore fallback failure, retain empty items
      }
    }

    // Format output payload
    const tracks: TrackResult[] = items.map((item) => {
      const primaryArtist = item.artists?.[0]?.name || 'Unknown Artist';
      const allArtists = item.artists?.map((a) => a.name).join(', ') || primaryArtist;
      const albumCoverUrl = item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || null;
      const isrc = item.external_ids?.isrc || null;

      return {
        id: item.id,
        name: item.name,
        primaryArtist,
        artists: allArtists,
        albumName: item.album?.name || 'Unknown Album',
        albumCoverUrl,
        isrc,
        spotifyUrl: item.external_urls?.spotify || null,
        releaseDate: item.album?.release_date,
      };
    });

    return NextResponse.json({
      tracks,
      count: tracks.length,
      query: { songName, artistName },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('ISRC Finder API error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to search Spotify for track.', details: errorMessage },
      { status: 500 }
    );
  }
}
