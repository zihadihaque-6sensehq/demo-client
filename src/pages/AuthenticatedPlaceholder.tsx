type AuthenticatedPlaceholderProps = {
  userId?: string;
};

export function AuthenticatedPlaceholder({ userId }: AuthenticatedPlaceholderProps) {
  return (
    <main className="authenticated-shell">
      <div>
        <h1>Signed in</h1>
        {userId ? <p>User ID: {userId}</p> : null}
      </div>
    </main>
  );
}
