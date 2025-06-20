import 'dotenv/config';
import { generateSampleData } from './sampleData';
import { generateTestUsers } from './generateTestUsers';

// Script to generate sample data
const main = async () => {
  try {
    console.log('Starting sample data generation...');
    
    // First generate users (90% citizens, 10% representatives)
    console.log('Generating test users...');
    const userResult = await generateTestUsers(20, 10); // 20 users, 10% representatives
    console.log('User generation result:', userResult);
    
    if (userResult.success && userResult.stats.total > 0) {
      // Then generate ideas and votes
      console.log('Generating ideas and votes...');
      const dataResult = await generateSampleData(
        userResult.stats.total,  // Use all created users
        4,   // 4 ideas per user
        10   // Up to 10 votes per idea
      );
      console.log('Sample data generation completed!');
      console.log('Generated:', dataResult);
    } else {
      console.log('Skipping idea generation due to user creation issues');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

main();