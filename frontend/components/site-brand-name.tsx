type SiteBrandNameProps = {
  className?: string;
};

export function SiteBrandName({ className }: SiteBrandNameProps) {
  return (
    <span className={className}>
      <span className="site-wordmark-line">Tiny</span>
      <span className="site-wordmark-line">Frames</span>
    </span>
  );
}
