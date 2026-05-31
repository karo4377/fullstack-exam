import { ImageIcon } from 'lucide-react';

type ImagePlaceholderProps = {
  label?: string;
  className?: string;
  compact?: boolean;
};

export function ImagePlaceholder({
  label = 'No image',
  className = '',
  compact = false,
}: ImagePlaceholderProps) {
  const classes = [
    'image-placeholder',
    compact ? 'image-placeholder--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="img" aria-label={label}>
      <ImageIcon className="image-placeholder-icon" aria-hidden strokeWidth={1.5} />
    </div>
  );
}
