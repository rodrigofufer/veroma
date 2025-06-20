import { supabase } from './supabaseClient';

// Sample locations for realistic geographic distribution
const locations = [
  { city: 'New York', country: 'United States', level: 'ciudad' },
  { city: 'London', country: 'United Kingdom', level: 'ciudad' },
  { city: 'Tokyo', country: 'Japan', level: 'ciudad' },
  { city: 'Paris', country: 'France', level: 'ciudad' },
  { city: 'Berlin', country: 'Germany', level: 'ciudad' },
  { city: 'Sydney', country: 'Australia', level: 'ciudad' },
  { city: 'Toronto', country: 'Canada', level: 'ciudad' },
  { city: 'Mumbai', country: 'India', level: 'ciudad' },
  { city: 'São Paulo', country: 'Brazil', level: 'ciudad' },
  { city: 'Mexico City', country: 'Mexico', level: 'ciudad' },
  { city: 'Madrid', country: 'Spain', level: 'ciudad' },
  { city: 'Rome', country: 'Italy', level: 'ciudad' },
  { city: 'Amsterdam', country: 'Netherlands', level: 'ciudad' },
  { city: 'Stockholm', country: 'Sweden', level: 'ciudad' },
  { city: 'Seoul', country: 'South Korea', level: 'ciudad' }
];

const categories = [
  'infraestructura',
  'salud',
  'seguridad',
  'educacion',
  'ambiente',
  'transporte',
  'cultura',
  'economia',
  'otro'
];

const ideaTypes = ['complaint', 'proposal', 'vote'];

// Sample ideas for each category
const ideaTemplates = {
  infraestructura: [
    'Improve street lighting in {location}',
    'Fix potholes on main roads in {location}',
    'Build new bike lanes in downtown {location}',
    'Renovate public parks in {location}',
    'Install smart traffic lights in {location}',
    'Create more accessible sidewalks in {location}',
    'Upgrade public buildings in {location}',
    'Develop underground utility tunnels in {location}',
    'Construct a new community center in {location}',
    'Modernize water infrastructure in {location}'
  ],
  salud: [
    'Open new medical clinic in {location}',
    'Increase ambulance coverage in {location}',
    'Create mental health support center in {location}',
    'Implement air quality monitoring in {location}',
    'Start health education program in {location}',
    'Establish mobile vaccination units in {location}',
    'Build a specialized children\'s hospital in {location}',
    'Create elderly care facilities in {location}',
    'Implement telemedicine services in {location}',
    'Develop addiction recovery programs in {location}'
  ],
  seguridad: [
    'Install security cameras in {location} downtown',
    'Increase police patrols in {location}',
    'Create neighborhood watch program in {location}',
    'Improve emergency response system in {location}',
    'Install better street lighting for safety in {location}',
    'Implement community policing initiatives in {location}',
    'Create safe routes to schools in {location}',
    'Develop disaster preparedness plan for {location}',
    'Install emergency call boxes throughout {location}',
    'Create youth crime prevention programs in {location}'
  ],
  educacion: [
    'Build new library in {location}',
    'Modernize school facilities in {location}',
    'Start adult education program in {location}',
    'Create after-school programs in {location}',
    'Implement digital literacy courses in {location}',
    'Establish scholarship fund for {location} students',
    'Create vocational training center in {location}',
    'Develop language learning programs in {location}',
    'Improve teacher training in {location} schools',
    'Create STEM education initiatives in {location}'
  ],
  ambiente: [
    'Plant more trees in {location}',
    'Start recycling program in {location}',
    'Clean up {location} river',
    'Create community gardens in {location}',
    'Reduce pollution in {location}',
    'Implement renewable energy projects in {location}',
    'Create wildlife conservation areas near {location}',
    'Develop sustainable water management in {location}',
    'Start composting initiative in {location}',
    'Create environmental education center in {location}'
  ],
  transporte: [
    'Add new bus routes in {location}',
    'Improve subway system in {location}',
    'Create car-free zones in {location}',
    'Install electric vehicle charging stations in {location}',
    'Expand bike sharing program in {location}',
    'Develop carpooling incentives for {location} commuters',
    'Create dedicated bus lanes in {location}',
    'Implement smart traffic management in {location}',
    'Improve pedestrian crossings in {location}',
    'Develop water taxi service in {location}'
  ],
  cultura: [
    'Organize cultural festival in {location}',
    'Support local artists in {location}',
    'Create public art spaces in {location}',
    'Build community center in {location}',
    'Start cultural exchange program in {location}',
    'Preserve historical buildings in {location}',
    'Create outdoor performance spaces in {location}',
    'Develop multicultural education programs in {location}',
    'Establish art galleries in {location}',
    'Create film festival in {location}'
  ],
  economia: [
    'Support small businesses in {location}',
    'Create job training center in {location}',
    'Develop tourism program for {location}',
    'Start local market in {location}',
    'Attract new businesses to {location}',
    'Create microfinance programs for {location} entrepreneurs',
    'Develop co-working spaces in {location}',
    'Implement local currency for {location} businesses',
    'Create business incubator in {location}',
    'Develop export opportunities for {location} products'
  ],
  otro: [
    'Improve community engagement in {location}',
    'Create youth programs in {location}',
    'Support elderly services in {location}',
    'Develop innovation hub in {location}',
    'Start community outreach in {location}',
    'Create volunteer coordination center in {location}',
    'Develop intergenerational programs in {location}',
    'Create pet-friendly areas in {location}',
    'Implement community decision-making platform for {location}',
    'Develop digital inclusion programs in {location}'
  ]
};

const generateDescription = (title: string, category: string, type: string) => {
  const descriptions: Record<string, string> = {
    complaint: `Current situation: The ${category} in our area needs immediate attention. ${title.toLowerCase()} to address ongoing issues that affect our daily lives. This has been a persistent problem that requires proper attention from authorities.

Impact: This issue affects thousands of residents and visitors, causing inconvenience and potential safety concerns.

Requested action: We urge the relevant authorities to address this situation promptly and implement necessary improvements.`,

    proposal: `Background: Our community has identified the need to ${title.toLowerCase()}. This initiative aims to enhance the quality of life for all residents.

Benefits:
- Improved community infrastructure
- Enhanced safety and accessibility
- Better quality of life for residents
- Long-term economic benefits
- Sustainable development

Implementation: This project can be completed within 6-12 months with proper funding and community support. We suggest a phased approach to minimize disruption.`,

    vote: `Question: Should we ${title.toLowerCase()}?

Context: This initiative has been proposed by community members and requires public input to move forward.

Important considerations:
- Cost and budget implications
- Timeline for implementation
- Community impact
- Environmental factors
- Long-term sustainability

Your vote will help determine the future of this project in our community.`
  };

  return descriptions[type] || descriptions.proposal;
};

const generateRandomDate = (startDate: Date, endDate: Date) => {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
};

export const generateSampleData = async (
  numUsers = 50,
  numIdeasPerUser = 4,
  maxVotesPerIdea = 20
) => {
  try {
    console.log('Starting sample data generation...');
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, role')
      .order('created_at', { ascending: false })
      .limit(numUsers);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }
    
    if (!users || users.length === 0) {
      console.error('No users found. Please create users first.');
      return { users: 0, ideas: 0, votes: 0 };
    }
    
    console.log(`Found ${users.length} users to generate ideas for`);

    // Generate ideas
    const ideas = [];
    for (const user of users) {
      const numIdeas = Math.floor(Math.random() * numIdeasPerUser) + 1; // At least 1 idea per user
      
      for (let i = 0; i < numIdeas; i++) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const type = ideaTypes[Math.floor(Math.random() * ideaTypes.length)];
        const templates = ideaTemplates[category as keyof typeof ideaTemplates];
        const titleTemplate = templates[Math.floor(Math.random() * templates.length)];
        const title = titleTemplate.replace('{location}', location.city);
        const isAnonymous = Math.random() > 0.8;
        
        // Representatives have a chance to create official proposals
        const isOfficialProposal = user.role === 'representative' && Math.random() > 0.7;
        
        // Set voting deadline for official proposals (between 1 week and 3 months from now)
        const now = new Date();
        const oneWeekLater = new Date(now);
        oneWeekLater.setDate(now.getDate() + 7);
        
        const threeMonthsLater = new Date(now);
        threeMonthsLater.setMonth(now.getMonth() + 3);
        
        const votingEndsAt = isOfficialProposal ? 
          generateRandomDate(oneWeekLater, threeMonthsLater).toISOString() : 
          null;
        
        const idea = {
          user_id: user.id,
          title,
          description: generateDescription(title, category, type),
          type,
          location: location.city,
          country: location.country,
          category,
          location_value: location.city,
          location_level: location.level,
          is_anonymous: isAnonymous,
          is_official_proposal: isOfficialProposal,
          voting_ends_at: votingEndsAt,
          created_at: generateRandomDate(new Date('2025-01-01'), new Date()).toISOString()
        };

        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .insert([idea])
          .select()
          .single();

        if (ideaError) {
          console.error(`Error creating idea for user ${user.id}:`, ideaError);
          continue;
        }

        ideas.push(ideaData);
        console.log(`Created ${type} idea: "${title}" by user ${user.id}`);
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log(`Created ${ideas.length} ideas`);

    // Generate votes
    let totalVotes = 0;
    for (const idea of ideas) {
      const numVotes = Math.floor(Math.random() * maxVotesPerIdea);
      const voters = [...users]
        .sort(() => Math.random() - 0.5)
        .slice(0, numVotes);

      for (const voter of voters) {
        // Skip if voter is the idea creator (can't vote on own ideas)
        if (voter.id === idea.user_id) continue;
        
        const vote = {
          user_id: voter.id,
          idea_id: idea.id,
          vote_type: Math.random() > 0.3 ? 'up' : 'down',
          voted_at: generateRandomDate(new Date(idea.created_at), new Date()).toISOString()
        };

        const { error: voteError } = await supabase
          .from('votes')
          .insert([vote]);

        if (voteError) {
          console.error(`Error creating vote for idea ${idea.id}:`, voteError);
          continue;
        }

        totalVotes++;
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }

    console.log(`Created ${totalVotes} votes`);
    
    return {
      users: users.length,
      ideas: ideas.length,
      votes: totalVotes
    };
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
};