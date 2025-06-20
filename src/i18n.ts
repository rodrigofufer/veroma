import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Landing Page
      'landing.hero.title': 'Your Voice, From Local to Global',
      'landing.hero.subtitle': 'Veroma empowers citizens to raise their concerns, share ideas, and vote on proposals that impact their communities and the world.',
      'landing.hero.cta': 'Get Started',
      
      // Dashboard
      'dashboard.welcome': 'Welcome to Veroma',
      'dashboard.subtitle': 'Explore ideas from your community and around the world',
      'dashboard.location.placeholder': 'Enter your location (city, district)',
      'dashboard.location.button': 'Update Location',
      'dashboard.empty.local': 'No ideas found for this location.',
      'dashboard.empty.global': 'No global ideas found yet.',
      'dashboard.empty.cta': 'Share an Idea',
      
      // Voting System
      'voting.remaining': 'You have {{count}} votes remaining',
      'voting.reset': 'Votes reset on {{date}}',
      'voting.limit': 'You have reached your weekly vote limit',
      'voting.info.title': 'Weekly Voting System',
      'voting.info.description': 'Every week you receive 10 votes to support or oppose ideas. Votes reset every Monday at 00:00 UTC.',
      'voting.success': 'Vote recorded successfully',
      'voting.error': 'Error recording vote',
      'voting.login': 'Please log in to vote',
      
      // Auth
      'auth.login.title': 'Log in to Veroma',
      'auth.signup.title': 'Create your Veroma account',
      
      // Profile
      'profile.title': 'Your Profile',
      'profile.edit': 'Edit Profile',
      'profile.ideas': 'Your Ideas',
      'profile.empty': 'You haven\'t shared any ideas yet.',
      'profile.firstIdea': 'Share Your First Idea',
      'profile.votes.remaining': 'Weekly Votes Remaining',
      'profile.votes.reset': 'Next Reset'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;