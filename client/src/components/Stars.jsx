import { Star } from 'lucide-react';

export default function Stars({ rating, size = 14 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? '#fbbf24' : 'none'}
          className={i <= rating ? '' : 'star-empty'}
        />
      ))}
    </span>
  );
}
