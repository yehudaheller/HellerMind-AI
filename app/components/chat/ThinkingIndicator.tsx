import { memo } from 'react';

export const ThinkingIndicator = memo(() => {
  return (
    <div
      className="hm-thinking-card hm-shimmer mt-4 w-full rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="HellerMind-AI is thinking"
    >
      <div className="flex items-center gap-3">
        <span className="hm-thinking-orb" aria-hidden="true">
          <span className="i-ph:brain-duotone text-lg" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-bolt-elements-textPrimary">HellerMind-AI is thinking</div>
          <div className="mt-1.5 flex flex-col gap-1.5" aria-hidden="true">
            <span className="hm-thinking-line w-[72%]" />
            <span className="hm-thinking-line w-[46%]" />
          </div>
        </div>
        <span className="hm-thinking-pulse" aria-hidden="true" />
      </div>
    </div>
  );
});

ThinkingIndicator.displayName = 'ThinkingIndicator';
