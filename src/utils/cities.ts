// Import cities and municipalities data from a reliable source
export const cities = [
  // Major cities worldwide
  { name: 'New York City', country: 'United States', type: 'city' },
  { name: 'Los Angeles', country: 'United States', type: 'city' },
  { name: 'Chicago', country: 'United States', type: 'city' },
  { name: 'London', country: 'United Kingdom', type: 'city' },
  { name: 'Paris', country: 'France', type: 'city' },
  { name: 'Berlin', country: 'Germany', type: 'city' },
  { name: 'Madrid', country: 'Spain', type: 'city' },
  { name: 'Rome', country: 'Italy', type: 'city' },
  { name: 'Tokyo', country: 'Japan', type: 'city' },
  { name: 'Beijing', country: 'China', type: 'city' },
  { name: 'Seoul', country: 'South Korea', type: 'city' },
  { name: 'Sydney', country: 'Australia', type: 'city' },
  { name: 'São Paulo', country: 'Brazil', type: 'city' },
  { name: 'Mexico City', country: 'Mexico', type: 'city' },
  { name: 'Mumbai', country: 'India', type: 'city' },
  { name: 'Moscow', country: 'Russia', type: 'city' },
  { name: 'Istanbul', country: 'Turkey', type: 'city' },
  { name: 'Dubai', country: 'United Arab Emirates', type: 'city' },
  { name: 'Singapore', country: 'Singapore', type: 'city' },
  { name: 'Toronto', country: 'Canada', type: 'city' },
  // Add hundreds more cities...
];

export const municipalities = [
  // Municipalities/Districts within major cities
  { name: 'Manhattan', city: 'New York City', country: 'United States', type: 'municipality' },
  { name: 'Brooklyn', city: 'New York City', country: 'United States', type: 'municipality' },
  { name: 'Queens', city: 'New York City', country: 'United States', type: 'municipality' },
  { name: 'Westminster', city: 'London', country: 'United Kingdom', type: 'municipality' },
  { name: 'Camden', city: 'London', country: 'United Kingdom', type: 'municipality' },
  { name: 'Montmartre', city: 'Paris', country: 'France', type: 'municipality' },
  { name: 'Le Marais', city: 'Paris', country: 'France', type: 'municipality' },
  { name: 'Shibuya', city: 'Tokyo', country: 'Japan', type: 'municipality' },
  { name: 'Shinjuku', city: 'Tokyo', country: 'Japan', type: 'municipality' },
  { name: 'Kreuzberg', city: 'Berlin', country: 'Germany', type: 'municipality' },
  { name: 'Prenzlauer Berg', city: 'Berlin', country: 'Germany', type: 'municipality' },
  // Add hundreds more municipalities...
];

export type Location = {
  name: string;
  country: string;
  type: 'city' | 'municipality';
  city?: string;
};

export function searchLocations(query: string): Location[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];

  const allLocations: Location[] = [
    ...cities,
    ...municipalities
  ];

  return allLocations
    .filter(location => 
      location.name.toLowerCase().includes(normalizedQuery) ||
      location.country.toLowerCase().includes(normalizedQuery) ||
      (location.city?.toLowerCase().includes(normalizedQuery))
    )
    .slice(0, 10); // Limit results to 10 items for better performance
}