// Admission examines natural-language prose, not identifiers or code literals.
// Short technical notes are ambiguous and remain usable; see docs/uploads.md.
export function hasEnglishProse(content: string) {
  let fence: { marker: string; length: number } | null = null;
  const prose: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const delimiter = line.match(/^\s*(`{3,}|~{3,})/);
    if (delimiter) {
      const marker = delimiter[1][0];
      if (!fence) fence = { marker, length: delimiter[1].length };
      else if (marker === fence.marker && delimiter[1].length >= fence.length)
        fence = null;
      continue;
    }
    if (!fence && !/^(?: {4}|\t)/.test(line)) prose.push(line);
  }
  const text = prose
    .join('\n')
    .replace(/`+[^`]*`+/g, ' ')
    .replace(/!?(\[[^\]]*\])\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]*>/g, ' ');
  const letters = text.match(/\p{L}/gu) || [];
  if (!letters.length) return true;
  const latin = letters.filter((letter) => /\p{Script=Latin}/u.test(letter));
  if (latin.length / letters.length < 0.6) return false;
  const words =
    text
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .match(/[a-z]+/g) || [];
  if (words.length < 8) return true;
  const cues = new Set(
    'a an the this that these those is are be and or for from with without to of in on your you we our before after then run use copy open start install set configure guide setup frontend backend onboarding instructions project document'.split(
      ' ',
    ),
  );
  return new Set(words.filter((word) => cues.has(word))).size >= 2;
}
