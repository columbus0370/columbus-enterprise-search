export const LoadingSpinner = ({ size = 'md', label }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-white/20 border-t-accent-400`}
        role="status"
        aria-label="読み込み中"
      />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
};
