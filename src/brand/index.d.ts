// Tipos para proyectos TypeScript (los componentes están en .jsx).
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';

export interface SkyChameleonProps extends ComponentPropsWithoutRef<'svg'> {
  /** Texto accesible; null si Sky es decorativo. */
  title?: string | null;
  /** Al aumentar (p. ej. el nivel), Sky cambia de color brevemente. */
  celebrateKey?: number | string;
}
export function SkyChameleon(props: SkyChameleonProps): ReactElement;

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

export const SKY_VIEWBOX: string;
export const SKY_STROKE: number;
export const SKY_STROKES: ReadonlyArray<{ id: string; d: string }>;
export const SKY_FILLS: ReadonlyArray<{ id: string; d: string }>;
export const SKY_EYE: { cx: number; cy: number; r: number };
