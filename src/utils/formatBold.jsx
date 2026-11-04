const BOLD_PATTERN = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*/g;

const toSegments = (text) => {
  const source = String(text ?? '');
  const segments = [];
  let lastIndex = 0;

  for (const match of source.matchAll(BOLD_PATTERN)) {
    if (match.index > lastIndex) {
      segments.push({ bold: false, value: source.slice(lastIndex, match.index) });
    }
    segments.push({ bold: true, value: match[1] ?? match[2] ?? '' });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    segments.push({ bold: false, value: source.slice(lastIndex) });
  }

  return segments;
};

export const renderBold = (text) =>
  toSegments(text).map((segment, index) =>
    segment.bold ? (
      <strong key={index} className="font-semibold text-ink">
        {segment.value}
      </strong>
    ) : (
      segment.value
    )
  );

export const stripBold = (text) =>
  toSegments(text)
    .map((segment) => segment.value)
    .join('');
