import { SVGCollection, SVGChar } from '../types';
import { glifosRushmoreCollection } from './glifosRushmore';
import { tulipanaCollection } from './tulipana';

const defaultChars: SVGChar[] = [
  {
    id: 'dot',
    name: 'Dot',
    svg: '<circle cx="6" cy="6" r="2" fill="currentColor"/>',
    luminance: 0.1,
  },
  {
    id: 'small-circle',
    name: 'Small Circle',
    svg: '<circle cx="6" cy="6" r="3" fill="currentColor"/>',
    luminance: 0.25,
  },
  {
    id: 'circle',
    name: 'Circle',
    svg: '<circle cx="6" cy="6" r="5" fill="currentColor"/>',
    luminance: 0.5,
  },
  {
    id: 'square',
    name: 'Square',
    svg: '<rect x="1" y="1" width="10" height="10" fill="currentColor"/>',
    luminance: 0.65,
  },
  {
    id: 'cross',
    name: 'Cross',
    svg: '<path d="M 4 0 L 8 0 L 8 4 L 12 4 L 12 8 L 8 8 L 8 12 L 4 12 L 4 8 L 0 8 L 0 4 L 4 4 Z" fill="currentColor"/>',
    luminance: 0.75,
  },
  {
    id: 'filled',
    name: 'Filled',
    svg: '<rect width="12" height="12" fill="currentColor"/>',
    luminance: 1,
  },
  {
    id: 'triangle',
    name: 'Triangle',
    svg: '<path d="M 6 1 L 11 11 L 1 11 Z" fill="currentColor"/>',
    luminance: 0.4,
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    svg: '<line x1="0" y1="12" x2="12" y2="0" stroke="currentColor" stroke-width="2"/>',
    luminance: 0.15,
  },
  {
    id: 'x-shape',
    name: 'X',
    svg: '<path d="M 2 2 L 10 10 M 10 2 L 2 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    luminance: 0.3,
  },
  {
    id: 'star',
    name: 'Star',
    svg: '<path d="M 6 1 L 7.5 4.5 L 11 5 L 8.5 7.5 L 9 11 L 6 9 L 3 11 L 3.5 7.5 L 1 5 L 4.5 4.5 Z" fill="currentColor"/>',
    luminance: 0.55,
  },
];

export const defaultCollection: SVGCollection = {
  id: 'default',
  name: 'Default Shapes',
  chars: defaultChars,
  createdAt: Date.now(),
};

export const glifosCollection: SVGCollection = {
  id: 'glifos-rushmore',
  name: 'Glifos Rushmore',
  chars: glifosRushmoreCollection,
  createdAt: Date.now(),
};

export const tulipanaCollectionData: SVGCollection = {
  id: 'tulipana',
  name: 'Tulipana',
  chars: tulipanaCollection,
  createdAt: Date.now(),
};
