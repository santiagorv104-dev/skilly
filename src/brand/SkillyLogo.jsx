import SkyChameleon from './SkyChameleon.jsx';

/**
 * Logotipo de Skilly: Sky el camaleón junto a la palabra "skilly".
 *
 * - size: 'sm' (barra de navegación) | 'md' (login, certificado) | 'lg' (landing).
 * - stacked: Sky encima de la palabra en lugar de al lado.
 * - as: elemento raíz ('span' por defecto; usa 'a' o el Link de tu router para enlazar).
 */
export default function SkillyLogo({
  size = 'md',
  stacked = false,
  celebrateKey,
  as: Root = 'span',
  className = '',
  ...rest
}) {
  const classes = [
    'skilly-logo',
    `skilly-logo--${size}`,
    stacked && 'skilly-logo--stacked',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Root className={classes} {...rest}>
      <SkyChameleon className="skilly-logo__sky" title={null} celebrateKey={celebrateKey} />
      <span className="skilly-logo__word">skilly</span>
    </Root>
  );
}
