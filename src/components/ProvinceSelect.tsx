import { PROVINCES } from "@/lib/provinces";

const SORTED = [...PROVINCES].sort((a, b) => a.th.localeCompare(b.th, "th"));

export function ProvinceOptions({ counts }: { counts?: Map<string, number> }) {
  return (
    <>
      {SORTED.map((p) => (
        <option key={p.en} value={p.en}>
          {p.th}
          {counts ? ` (${counts.get(p.en) ?? 0})` : ""}
        </option>
      ))}
    </>
  );
}

export function ProvinceSelect({
  name = "province",
  defaultValue,
  counts,
  allLabel = "ทุกจังหวัด",
  className = "field",
  id,
}: {
  name?: string;
  defaultValue?: string;
  counts?: Map<string, number>;
  allLabel?: string;
  className?: string;
  id?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue ?? ""} className={className}>
      <option value="">{allLabel}</option>
      <ProvinceOptions counts={counts} />
    </select>
  );
}
