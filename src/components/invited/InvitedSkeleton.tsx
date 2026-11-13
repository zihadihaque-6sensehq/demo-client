export function InvitedSkeleton() {
  const rows = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="overview-table-wrap" aria-busy="true" aria-label="Loading invites">
      <table className="overview-table overview-table--skeleton">
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col">Invited</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i}>
              {Array.from({ length: 3 }).map((_, j) => (
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
