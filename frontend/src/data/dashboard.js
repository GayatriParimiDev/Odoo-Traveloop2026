export const sidebarItems = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'My Trips', icon: 'trips' },
  { label: 'Saved Places', icon: 'saved' },
  { label: 'Experiences', icon: 'experiences' },
  { label: 'Messages', icon: 'messages' },
  { label: 'Bookings', icon: 'bookings' },
  { label: 'Settings', icon: 'settings' },
];

export const dashboardMetrics = [
  { icon: 'globe', title: '120+', subtitle: 'Countries curated' },
  { icon: 'pin', title: '10K+', subtitle: 'Destinations' },
  { icon: 'spark', title: '25K+', subtitle: 'Experiences' },
  { icon: 'users', title: '50K+', subtitle: 'Elite explorers' },
];

export const recentTrips = [
  {
    title: 'Cherry Blossom 2026',
    route: 'Tokyo -> Kyoto',
    dates: '12 Apr - 22 Apr',
    status: 'Planning',
    budget: 'INR 84,000',
    meta: '2 stops | 9 activities',
  },
  {
    title: 'Indian Heritage Tour',
    route: 'Ahmedabad -> Jaipur',
    dates: '03 May - 11 May',
    status: 'Public',
    budget: 'INR 41,500',
    meta: '3 stops | 6 activities',
  },
  {
    title: 'Weekend in Goa',
    route: 'Mumbai -> Goa',
    dates: '28 May - 31 May',
    status: 'Saved',
    budget: 'INR 24,200',
    meta: '1 stop | 4 activities',
  },
];

export const destinationCards = [
  { title: 'Swiss Alps', country: 'Switzerland', tag: 'Best for nature', tone: 'emerald' },
  { title: 'Amalfi Coast', country: 'Italy', tag: 'Best for romance', tone: 'terracotta' },
  { title: 'Petra', country: 'Jordan', tag: 'Best for culture', tone: 'sand' },
  { title: 'Baa Atoll', country: 'Maldives', tag: 'Best for relaxation', tone: 'sea' },
];

export const budgetBreakdown = [
  { label: 'Transport', value: 'INR 1.20L', percent: 72 },
  { label: 'Stay', value: 'INR 96K', percent: 58 },
  { label: 'Activities', value: 'INR 54K', percent: 36 },
  { label: 'Meals', value: 'INR 28K', percent: 22 },
];

export const quickActions = [
  { title: 'Plan New Trip', subtitle: 'Start a new itinerary', icon: 'plane', path: '/itinerary-builder' },
  { title: 'Add Stop', subtitle: 'Insert a city into an itinerary', icon: 'pin', path: '/itinerary-builder' },
  { title: 'Search Cities', subtitle: 'Compare costs and popularity', icon: 'search', path: '/city-search' },
  { title: 'Share Trip', subtitle: 'Copy a public itinerary link', icon: 'share', path: '/shared-itinerary' },
];
