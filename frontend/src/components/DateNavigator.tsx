interface DateNavigatorProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

function DateNavigator({ onPrevious, onNext, hasPrevious, hasNext }: DateNavigatorProps) {
  return (
    <nav className="date-navigator">
      <button
        className="nav-button"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        &laquo; Previous Edition
      </button>
      <span className="nav-divider">|</span>
      <button
        className="nav-button"
        onClick={onNext}
        disabled={!hasNext}
      >
        Next Edition &raquo;
      </button>
    </nav>
  );
}

export default DateNavigator;
