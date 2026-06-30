let exampleKeySeq = 0;

export function newExampleKey(): string {
  exampleKeySeq += 1;
  return `ex-${exampleKeySeq}`;
}
