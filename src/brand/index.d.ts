// Tipos para proyectos TypeScript (los componentes están en .jsx).
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';

export interface KikiProps extends ComponentPropsWithoutRef<'svg'> {
  /** Texto accesible; null si Kiki es decorativo. */
  title?: string | null;
  /** Al aumentar (p. ej. el nivel), Kiki cambia de color brevemente. */
  celebrateKey?: number | string;
}
export function Kiki(props: KikiProps): ReactElement;

export interface SkillyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  stacked?: boolean;
  celebrateKey?: number | string;
  as?: ElementType;
  className?: string;
  [prop: string]: unknown;
}
export function SkillyLogo(props: SkillyLogoProps): ReactElement;

export interface SplashScreenProps {
  /** Se llama cuando el splash termina de desvanecerse. */
  onDone?: () => void;
  tagline?: string;
}
export function SplashScreen(props: SplashScreenProps): ReactElement;
export function shouldShowSplash(): boolean;

export const KIKI_VIEWBOX: string;
export const KIKI_STROKE: number;
export const KIKI_STROKES: ReadonlyArray<{ id: string; d: string }>;
export const KIKI_FILLS: ReadonlyArray<{ id: string; d: string }>;
export const KIKI_EYE: { cx: number; cy: number; r: number };
