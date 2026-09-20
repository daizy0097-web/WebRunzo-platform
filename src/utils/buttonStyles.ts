/**
 * WebRunzo Button Style System
 * 
 * Standardized styling utilities for public website buttons.
 * Harmonizes padding, border radius (rounded-xl), font weight, shadows,
 * hover transitions, and keyboard focus states across action types.
 */

export const btnBase =
  'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export const btnSizes = {
  sm: 'text-xs px-3.5 py-2',
  md: 'text-xs sm:text-sm px-5 py-2.5',
  lg: 'text-sm sm:text-base px-7 py-3.5',
} as const;

export const btnVariants = {
  // Primary brand CTA (e.g., Get Started, Explore Templates, Submit)
  primary:
    'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0',

  // Inverted primary CTA for dark/indigo gradient backgrounds (e.g. Final CTA)
  primaryInverted:
    'bg-white hover:bg-slate-100 active:bg-slate-200 text-indigo-950 shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-white focus-visible:ring-offset-indigo-950',

  // Secondary/outline action (e.g., Hero secondary, Client Login, standard pricing CTA)
  secondary:
    'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-slate-100 border border-slate-700/80 hover:border-slate-600 shadow-sm hover:shadow',

  // Ghost/utility action (e.g., back navigation, inline cancel)
  ghost:
    'font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors',

  // Small icon/action button (e.g., close modal, mobile menu toggle)
  icon:
    'p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
} as const;

/**
 * Helper to compose standard button classes
 */
export function getButtonClass(
  variant: keyof typeof btnVariants,
  size?: keyof typeof btnSizes,
  extraClasses?: string
): string {
  const sizeClass = size ? btnSizes[size] : '';
  const variantClass = btnVariants[variant];
  return `${btnBase} ${variantClass} ${sizeClass} ${extraClasses || ''}`.trim().replace(/\s+/g, ' ');
}
