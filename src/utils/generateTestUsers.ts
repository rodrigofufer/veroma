import { supabase } from './supabaseClient';

// Sample countries with realistic distribution
const countries = [
  'United States', 'Mexico', 'Canada', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru',
  'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway',
  'Japan', 'South Korea', 'China', 'India', 'Australia', 'New Zealand', 'Singapore',
  'Nigeria', 'South Africa', 'Kenya', 'Egypt', 'Morocco', 'Ghana', 'Ethiopia',
  'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
  'Turkey', 'Israel', 'Saudi Arabia', 'UAE', 'Jordan', 'Lebanon', 'Qatar'
];

// Sample first names
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen',
  'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
  'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
  'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
  'Benjamin', 'Dorothy', 'Samuel', 'Amy', 'Gregory', 'Angela', 'Alexander', 'Ashley',
  'Frank', 'Brenda', 'Raymond', 'Emma', 'Jack', 'Olivia', 'Dennis', 'Cynthia',
  'Jerry', 'Marie', 'Tyler', 'Janet', 'Aaron', 'Catherine', 'Jose', 'Frances',
  'Henry', 'Christine', 'Adam', 'Samantha', 'Douglas', 'Debra', 'Nathan', 'Rachel',
  'Peter', 'Carolyn', 'Zachary', 'Janet', 'Kyle', 'Virginia', 'Noah', 'Maria',
  'Alan', 'Heather', 'Carl', 'Diane', 'Juan', 'Julie', 'Wayne', 'Joyce',
  'Roy', 'Victoria', 'Ralph', 'Kelly', 'Joe', 'Christina', 'Bruce', 'Lauren',
  'Eugene', 'Joan', 'Ethan', 'Judith', 'Billy', 'Olivia',
  'Dylan', 'Megan', 'Bryan', 'Cheryl', 'Willie', 'Martha', 'Gabriel', 'Andrea'
];

// Sample last names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee',
  'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez',
  'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans',
  'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox',
  'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson',
  'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross',
  'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes',
  'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander',
  'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham',
  'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens', 'Reynolds'
];

// Generate a random email based on name
const generateEmail = (firstName: string, lastName: string, index: number): string => {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'example.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
};

// Generate a secure random password
const generatePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure at least one of each character type
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // Add more random characters to reach minimum length of 8
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 6; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Main function to generate test users
export interface GenerationStats {
  total: number;
  citizens: number;
  representatives: number;
  errors: number;
}

export const generateTestUsers = async (
  numUsers: number = 100,
  representativePercentage: number = 10
): Promise<{ success: boolean; message: string; stats: GenerationStats }> => {
  try {
    console.log(`Starting generation of ${numUsers} test users (${representativePercentage}% representatives)...`);
    
    const users = [];
    const representativesCount = Math.floor(numUsers * (representativePercentage / 100));
    const citizensCount = numUsers - representativesCount;
    
    console.log(`Target: ${citizensCount} citizens and ${representativesCount} representatives`);
    
    let createdCitizens = 0;
    let createdRepresentatives = 0;
    let errors = 0;
    
    // Create citizens first
    for (let i = 0; i < numUsers; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const email = generateEmail(firstName, lastName, i);
      const password = generatePassword();
      const isRepresentative = createdRepresentatives < representativesCount && 
                              (Math.random() * 100 < representativePercentage || 
                               numUsers - i <= representativesCount - createdRepresentatives);
      
      try {
        // Create user with standard signUp method instead of admin.createUser
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: firstName,
              lastname: lastName,
              country: country
            }
          }
        });

        if (authError) {
          console.error(`Error creating user ${i}:`, authError);
          errors++;
          continue;
        }

        // If user was created successfully
        if (authData.user) {
          // Manually update email_confirmed_at in profiles table
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              email_confirmed_at: new Date().toISOString(),
              role: isRepresentative ? 'representative' : 'user'
            })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error(`Error updating profile for user ${i}:`, updateError);
            errors++;
          } else {
            if (isRepresentative) {
              createdRepresentatives++;
              console.log(`Created representative #${createdRepresentatives}: ${firstName} ${lastName} (${country})`);
            } else {
              createdCitizens++;
              console.log(`Created citizen #${createdCitizens}: ${firstName} ${lastName} (${country})`);
            }
          }

          users.push({
            id: authData.user.id,
            email,
            name: firstName,
            lastname: lastName,
            country,
            role: isRepresentative ? 'representative' : 'user'
          });
        }
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error creating user ${i}:`, error);
        errors++;
      }
    }

    return {
      success: true,
      message: `Created ${createdCitizens} citizens and ${createdRepresentatives} representatives with ${errors} errors`,
      stats: {
        total: createdCitizens + createdRepresentatives,
        citizens: createdCitizens,
        representatives: createdRepresentatives,
        errors
      }
    };
  } catch (error) {
    console.error('Error generating test users:', error);
    return {
      success: false,
      message: `Error generating test users: ${error}`,
      stats: {
        total: 0,
        citizens: 0,
        representatives: 0,
        errors: 1
      }
    };
  }
};