export default function AppIcon({ kind }) {
  switch (kind) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case 'trips':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 8.5h11v9.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5V8.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M8.2 8.5V6.8A1.8 1.8 0 0 1 10 5h4a1.8 1.8 0 0 1 1.8 1.8v1.7" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9.2 12h5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'saved':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7.5 5.5h9v14l-4.5-2.8-4.5 2.8v-14Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'experiences':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4.8 14.2 9l4.7.7-3.4 3.3.8 4.7L12 15.4 7.7 17.7l.8-4.7L5 9.7 9.8 9 12 4.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'messages':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 6.8h14v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3v-3.1A1.4 1.4 0 0 1 4 16.3v-7.8A1.7 1.7 0 0 1 5 6.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'bookings':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 3.8v3.4M16 3.8v3.4M7 10.5h10M7 14h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m12 8.1 1.5 1 .4 1.8 1.8.4 1 1.5-1 1.5-1.8.4-.4 1.8-1.5 1-1.5-1-.4-1.8-1.8-.4-1-1.5 1-1.5 1.8-.4.4-1.8 1.5-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case 'globe':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
          <path d="M5 12h14M12 5c2.5 2.3 2.5 11.7 0 14M12 5c-2.5 2.3-2.5 11.7 0 14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 20s5-4.8 5-9.2A5 5 0 1 0 7 10.8C7 15.2 12 20 12 20Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10.5" r="1.7" fill="currentColor" />
        </svg>
      );
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4.5 13.7 9l4.5 1.7-4.5 1.7L12 16.9l-1.7-4.5L5.8 10.7 10.3 9 12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="8.3" r="2.6" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="16.5" cy="8.9" r="2.1" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4.5 18c1.3-2.7 3.4-4 6.2-4s4.8 1.3 6.1 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'plane':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m4 12.2 15.8-6.1c.7-.3 1.4.4 1.1 1.1l-6.1 15.8-2.8-6.1-6.1-2.8 6.1-2.9-2.9-2.9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'share':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="7" cy="12" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.7 11 15.4 8.1M8.7 13 15.4 15.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4.5 18 7v4.1c0 4-2.2 6.7-6 8.4-3.8-1.7-6-4.4-6-8.4V7l6-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="m9.8 12.2 1.5 1.5 2.8-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 8.2v4.2l2.7 1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
