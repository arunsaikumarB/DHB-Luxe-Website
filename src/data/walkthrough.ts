export type WalkthroughCta = {
  label: string
  href: string
}

export type WalkthroughSection = {
  id: string
  src: string
  label: string
  title: string
  headline?: string
  description: string
  features?: string[]
  cta?: WalkthroughCta
  secondaryCta?: WalkthroughCta
  variant: 'hero' | 'features' | 'editorial' | 'cards' | 'list' | 'experience' | 'finale'
}

export const walkthroughSections: WalkthroughSection[] = [
  {
    id: 'elevations',
    src: '/videos/01-elevation.mp4?v=smooth4',
    label: '01 — Elevations',
    title: 'Elevations',
    headline: 'Building Dream Homes Across New Jersey',
    description:
      'A continuous cinematic journey through a custom luxury residence — controlled entirely by your scroll.',
    cta: { label: 'Start Your Vision', href: '#contact' },
    secondaryCta: { label: 'Explore the Home', href: '#about' },
    variant: 'hero',
  },
  {
    id: 'living-rooms',
    src: '/videos/02-living-room.mp4?v=smooth4',
    label: '02 — Living Rooms',
    title: 'Living Rooms',
    description:
      'Volumes of light and proportion where gathering feels effortless — materials chosen for calm, permanence, and presence.',
    features: ['Double-height volumes', 'Floor-to-ceiling glazing', 'Bespoke millwork', 'Quiet acoustics'],
    variant: 'features',
  },
  {
    id: 'bedrooms',
    src: '/videos/03-bedroom.mp4?v=smooth4',
    label: '03 — Bedrooms',
    title: 'Bedrooms',
    description:
      'Private sanctuaries composed with soft light, tactile finishes, and a sense of retreat from the world outside.',
    features: ['Primary suite retreat', 'Custom wardrobes', 'Layered ambient lighting'],
    variant: 'editorial',
  },
  {
    id: 'bathrooms',
    src: '/videos/04-bathroom.mp4?v=smooth4',
    label: '04 — Bathrooms',
    title: 'Bathrooms',
    description:
      'Spa-caliber wet spaces — stone, water, and mirror aligned with architectural precision.',
    features: ['Stone wet rooms', 'Freestanding vessels', 'Heated surfaces', 'Museum lighting'],
    variant: 'cards',
  },
  {
    id: 'kitchen',
    src: '/videos/05-kitchen.mp4?v=smooth4',
    label: '05 — Kitchen & Wet Bars',
    title: 'Kitchen & Wet Bars',
    headline: 'Culinary Architecture',
    description:
      'The social heart of the home — performance kitchens and intimate wet bars designed for both ritual and celebration.',
    features: [
      'Chef-grade appliances',
      'Stone islands',
      'Concealed storage',
      'Entertaining wet bars',
      'Integrated lighting',
    ],
    variant: 'list',
  },
  {
    id: 'interiors',
    src: '/videos/06-interior.mp4?v=smooth4',
    label: '06 — Interiors',
    title: 'Interiors',
    description:
      'A continuous material language from threshold to terrace — every corridor, stair, and gallery considered as architecture.',
    features: ['Unified material palette', 'Sculptural circulation', 'Art-ready walls'],
    variant: 'experience',
  },
  {
    id: 'balcony-garage',
    src: '/videos/07-balcony-garage.mp4?v=smooth4',
    label: '07 — Balcony & Garage',
    title: 'Balcony & Garage',
    headline: 'Where the journey opens outward',
    description:
      'Outdoor living and arrival sequences finished with the same discipline as the interiors — the final frame of a single unbroken walkthrough.',
    cta: { label: 'Request a Consultation', href: '#contact' },
    variant: 'finale',
  },
]
