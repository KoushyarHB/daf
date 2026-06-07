import { iterGrammarAdjSuffixRuns } from "@/lib/vocab/card-utils";
import type { GrammarTable } from "@/lib/vocab/types";

type GrammarTableProps = {
  table: GrammarTable;
};

function formatGrammarPhraseCell(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;
  for (const [chunk, isSuffix] of iterGrammarAdjSuffixRuns(text)) {
    if (!chunk) continue;
    if (isSuffix) {
      parts.push(
        <strong key={key++} className="grammar-adj-sfx">
          {chunk}
        </strong>,
      );
    } else {
      parts.push(<span key={key++}>{chunk}</span>);
    }
  }
  return parts;
}

export default function GrammarTableBlock({ table }: GrammarTableProps) {
  const { columns, rows } = table;
  const nc = columns.length;
  const narrowFirstCol = nc > 0 && columns[0].trim() === "";

  return (
    <div className="grammar-table-wrap">
      <table className="grammar-table">
        {narrowFirstCol ? (
          <colgroup>
            <col className="grammar-col-case" />
            {nc > 1 ? <col span={nc - 1} /> : null}
          </colgroup>
        ) : nc > 0 ? (
          <colgroup>
            <col span={nc} />
          </colgroup>
        ) : null}
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {Array.from({ length: nc }, (_, j) => {
                const raw = j < row.length ? row[j] : "";
                return (
                  <td key={j}>
                    {j === 0 ? raw : formatGrammarPhraseCell(raw)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
