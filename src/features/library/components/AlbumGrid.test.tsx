import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { music } from '@/data/music';
import { AlbumGrid } from './AlbumGrid';

describe('AlbumGrid', () => {
  it('renders one card per album', () => {
    render(<AlbumGrid />);
    for (const album of music.albums) {
      expect(screen.getByText(album.title)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button')).toHaveLength(music.albums.length);
  });

  it('pluralizes track counts', () => {
    render(<AlbumGrid />);
    expect(screen.getByText('1 track')).toBeInTheDocument(); // Single Spin (1)
    expect(screen.getByText('4 tracks')).toBeInTheDocument(); // Cassette Sunset (4)
  });
});
