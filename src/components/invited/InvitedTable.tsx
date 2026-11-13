import { InvitedListItem } from "@/types/invited";
import { displayOptional, formatDateTime } from "@/utils/format";
import { StatusTag } from "@/components/overview/StatusTag";

interface InvitedTableProps {
  items: InvitedListItem[];
}

export function InvitedTable({ items }: InvitedTableProps) {
  return (
    <div className="overview-table-wrap">
      <table className="overview-table">
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col">Invited</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>{displayOptional(row.email)}</td>
              <td>{formatDateTime(row.invitedAt)}</td>
              <td>
                <StatusTag label={displayOptional(row.status)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
