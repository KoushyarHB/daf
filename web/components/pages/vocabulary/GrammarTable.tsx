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
        <strong key={key++} className="text-daf-blue font-bold">
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
    <div className="my-[0.35rem] mb-[0.65rem] pl-[0.6rem] border-l-[3px] border-transparent">
      <table className="w-full table-fixed border-collapse m-0 text-[9.5pt]">
        {narrowFirstCol ? (
          <colgroup>
            <col className="w-[3.25rem]" />
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
              <th
                key={i}
                className="border border-daf-border py-[0.35rem] px-[0.45rem] text-left align-top font-semibold bg-daf-head-panel text-daf-label"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {Array.from({ length: nc }, (_, j) => {
                const raw = j < row.length ? row[j] : "";
                return (
                  <td
                    key={j}
                    className="border border-daf-border py-[0.35rem] px-[0.45rem] text-left align-top"
                  >
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
