import {
  CHARACTER_POSES,
  CHARACTER_SRC,
  POSE_OFFSET_X,
  fallbackOnError,
  type CharacterPose,
} from './landingConfig';

interface CharacterFigureProps {
  pose: CharacterPose;
  className?: string;
  /** Kept for API compatibility; pose changes are always an instant frame swap. */
  instant?: boolean;
  /** Accessible description; pass an empty string when the figure is purely decorative. */
  label?: string;
}

/**
 * The three supplied 2D renders stacked on top of each other (all decoded up
 * front). Exactly one is visible; changing pose swaps frames instantly, so two
 * figures never overlap. No fake CSS "3D rotation".
 */
export function CharacterFigure({ pose, className = '', label }: CharacterFigureProps) {
  const ariaProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const };

  return (
    <div className={`relative aspect-[686/1024] ${className}`} {...ariaProps}>
      {CHARACTER_POSES.map((p) => {
        const isActive = p === pose;
        return (
          <img
            key={p}
            src={CHARACTER_SRC[p]}
            alt=""
            width={686}
            height={1024}
            loading="eager"
            decoding="async"
            fetchPriority={p === 'front' ? 'high' : 'auto'}
            draggable={false}
            onError={fallbackOnError(p)}
            className="nb-character-layer absolute inset-0 h-full w-full object-contain select-none pointer-events-none"
            style={{
              transform: `translateX(${POSE_OFFSET_X[p]})`,
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 2 : 1,
              // Poses swap like animation frames: never two figures visible at once.
              transition: 'none',
            }}
          />
        );
      })}
    </div>
  );
}
