import { Link } from "react-router-dom";

export function BrandLogo() {
  return (
    <Link to="/" className="marketing-brand" aria-label="SquareUp home">
      <span className="marketing-brand__mark" aria-hidden>
        <svg viewBox="0 0 24 24" width="18" height="18" role="presentation">
          <path
            fill="#0c0f0a"
            d="M12 4.5 4 9v6l8 4.5 8-4.5V9L12 4.5Zm0 2.2 5.5 3.1v4.4L12 17.3 6.5 14.2V9.8L12 6.7Z"
          />
        </svg>
      </span>
      <span className="marketing-brand__wordmark">SquareUp</span>
    </Link>
  );
}