import { ALL_FILTER, OverviewFilters } from "@/types/customers";
import type { FilterOptions } from "@/hooks/useCustomersList";

interface OverviewFiltersProps {
  filters: OverviewFilters;
  options: FilterOptions;
  disabled: boolean;
  onChange: (dimension: keyof OverviewFilters, value: string) => void;
}

function FilterSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <label className="filter-control" htmlFor={id}>
      <span className="filter-control__label">{label}</span>
      <select
        id={id}
        className="filter-control__select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={ALL_FILTER}>All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export function OverviewFiltersBar({
  filters,
  options,
  disabled,
  onChange,
}: OverviewFiltersProps) {
  return (
    <div className="overview-filters" role="group" aria-label="Customer filters">
      <FilterSelect
        label="State"
        value={filters.state}
        options={options.states}
        disabled={disabled}
        onChange={(v) => onChange("state", v)}
      />
      <FilterSelect
        label="Region"
        value={filters.region}
        options={options.regions}
        disabled={disabled}
        onChange={(v) => onChange("region", v)}
      />
      <FilterSelect
        label="Activity"
        value={filters.activity}
        options={options.activities}
        disabled={disabled}
        onChange={(v) => onChange("activity", v)}
      />
    </div>
  );
}
