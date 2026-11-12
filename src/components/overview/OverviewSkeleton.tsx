export function OverviewSkeleton() {
  const rows = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="overview-table-wrap" aria-busy="true" aria-label="Loading customers">
      <table className="overview-table overview-table--skeleton">
        <thead>
          <tr>
            <th scope="col">Customer</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">State</th>
            <th scope="col">Region</th>
            <th scope="col">Activity</th>
            <th scope="col">Latest haul</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j}>
                  <span className="skeleton-bar" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
