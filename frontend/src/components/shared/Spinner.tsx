interface Props { fullScreen?: boolean; size?: 'sm' | 'md' | 'lg'; }

export default function Spinner({ fullScreen, size = 'md' }: Props) {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  const spinner = (
    <div className={`${sizeClass} animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
}
