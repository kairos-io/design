export interface TokenRow {
  name: string;
  value: string;
  note?: string;
}

/** A plain three-column table of tokens: name, value, note. */
export function TokenTable({ rows, valueLabel = "Value" }: { rows: TokenRow[]; valueLabel?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="sb-unstyled w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 pr-3 font-medium">Token</th>
            <th className="py-2 pr-3 font-medium">{valueLabel}</th>
            <th className="py-2 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-line align-top">
              <td className="py-2 pr-3 font-mono text-xs font-semibold">{r.name}</td>
              <td className="py-2 pr-3 break-all font-mono text-xs">{r.value}</td>
              <td className="py-2 text-muted">{r.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
