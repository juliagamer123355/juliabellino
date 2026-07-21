const PATHS = {
  spade:
    "M12 2C9 6 3 10.5 3 15a5 5 0 0 0 8.2 3.9c-.3 2-1 3.1-2.7 4.1h7c-1.7-1-2.4-2.1-2.7-4.1A5 5 0 0 0 21 15c0-4.5-6-9-9-13Z",
  heart:
    "M12 21s-7.5-4.6-10.2-9.3C.2 8.9 1.4 5.3 4.8 4.3 7.2 3.6 9.6 4.7 12 7c2.4-2.3 4.8-3.4 7.2-2.7 3.4 1 4.6 4.6 3 7.4C19.5 16.4 12 21 12 21Z",
  diamond: "M12 2 21 12 12 22 3 12Z",
  club: "M12 2a3.3 3.3 0 0 0-3.3 3.3c0 .5.1 1 .3 1.4A3.3 3.3 0 1 0 8 12.9c.6 1.7-.1 2.9-1.7 3.7h11.4c-1.6-.8-2.3-2-1.7-3.7a3.3 3.3 0 1 0-1-6.2c.2-.4.3-.9.3-1.4A3.3 3.3 0 0 0 12 2Z",
};

export default function SuitIcon({ suit = "spade", className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={PATHS[suit]} />
    </svg>
  );
}
