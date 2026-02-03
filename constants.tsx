
import React from 'react';

// Tonal blue palettes derived from the primary branding color #1D9BF0
export const THEME_PALETTES = {
  light: [
    '#1D9BF0', // Primary
    '#1A8CD8', // Saturated Darker
    '#007BC2', // Deep Blue
    '#3EB0F2', // Lighter Cyan-Blue
    '#60C1F5', // Soft Blue
    '#006BAC', // Contrast Blue
    '#82D2F8', // Pale Blue
    '#0D8BD9', // Mid Blue
  ],
  dim: [
    '#1D9BF0', // Primary
    '#34A8F2', // Glowing Lighter
    '#60C2F6', // Soft Glow
    '#8CD2FA', // Icy Blue
    '#B8E2FD', // Very Light
    '#0D669F', // Deep Dim Blue
    '#1581C7', // Saturated Dim Blue
    '#064B77', // Very Deep Dim Blue
  ]
};

export const COLORS = THEME_PALETTES.dim; // Default fallback

export const THEME_COLORS = {
  light: {
    bg: 'bg-[#F9FAFB]',
    bgSecondary: 'bg-white',
    text: 'text-[#0F1419]',
    textSecondary: 'text-[#536471]',
    border: 'border-[#EFF3F4]',
    card: 'bg-white',
    hover: 'hover:bg-[#F7F9F9]',
    input: 'bg-white border-[#CFD9DE] focus:border-[#1D9BF0] text-[#0F1419]',
    buttonPrimary: 'bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white',
    buttonSecondary: 'bg-white border border-[#CFD9DE] hover:bg-[#F7F9F9] text-[#0F1419]',
  },
  dim: {
    bg: 'bg-[#15202B]',
    bgSecondary: 'bg-[#1E2732]',
    text: 'text-[#F7F9F9]',
    textSecondary: 'text-[#8B98A5]',
    border: 'border-[#38444D]',
    card: 'bg-[#15202B]',
    hover: 'hover:bg-[#1E2732]',
    input: 'bg-[#15202B] border-[#38444D] focus:border-[#1D9BF0] text-white',
    buttonPrimary: 'bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white',
    buttonSecondary: 'bg-[#15202B] border border-[#536471] hover:bg-[#1E2732] text-[#F7F9F9]',
  }
};
