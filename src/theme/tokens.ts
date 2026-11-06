const tokens = {
  color: {
    primary: '#1B7F4F',
    onPrimary: '#FFFFFF',
    accent: '#F59E0B',
    background: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
    toastBackground: '#111827',
    category: {
      fuel: '#F59E0B',
      food: '#22C55E',
      stock: '#3B82F6',
      rent: '#8B5CF6',
      other: '#9CA3AF',
    },
  },
  font: {
    family: "'Inter', sans-serif",
    title: { size: '24px', weight: '700' },
    heading: { size: '18px', weight: '600' },
    body: { size: '16px', weight: '400' },
    small: { size: '13px', weight: '400' },
  },
  space: {
    1: '4px',
    2: '8px',
    3: '16px',
    4: '24px',
    5: '32px',
    screen: {
      mobile: '16px',
      tablet: '32px',
      desktop: '24px',
    },
  },
  radius: {
    card: '8px',
    input: '6px',
    button: '6px',
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.1)',
  },
  size: {
    button: '48px',
    touchMin: '44px',
    contentMax: '1200px',
  },
  bp: {
    mobile: '640px',
    desktop: '1024px',
  },
  focus: {
    ring: '2px solid #1B7F4F',
  },
  hover: {
    darken: '10%',
  },
} as const;

export default tokens;
