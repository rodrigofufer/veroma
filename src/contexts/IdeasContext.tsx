import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';

export interface Idea {
  id: string;
  title: string;
  description: string;
  type: 'complaint' | 'proposal' | 'vote';
  location: string;
  country: string;
  created_at: string;
  user_id: string;
  upvotes: number;
  downvotes: number;
  is_anonymous: boolean;
  location_value: string;
  location_level: string;
  category: string;
  is_official_proposal?: boolean;
  voting_ends_at?: string | null;
  user_vote?: 'up' | 'down' | null;
  author_name?: string;
}

interface CreateIdeaData {
  title: string;
  description: string;
  type: 'complaint' | 'proposal' | 'vote';
  location: string;
  country: string;
  is_anonymous: boolean;
  location_value: string;
  location_level: string;
  category: string;
  is_official_proposal?: boolean;
  voting_ends_at?: string | null;
}

interface UpdateIdeaData {
  title?: string;
  description?: string;
}

interface IdeasContextType {
  ideas: Idea[];
  globalIdeas: Idea[];
  userIdeas: Idea[];
  loading: boolean;
  deleteIdea: (id: string) => Promise<void>;
  createIdea: (data: CreateIdeaData) => Promise<void>;
  updateIdea: (id: string, data: UpdateIdeaData) => Promise<void>;
  fetchIdeas: (location?: string) => Promise<void>;
  fetchGlobalIdeas: () => Promise<void>;
  fetchUserIdeas: () => Promise<void>;
  voteOnIdea: (ideaId: string, voteType: 'up' | 'down') => Promise<void>;
  voteStatus: { votes_remaining: number; votes_reset_at: string; weekly_vote_limit: number } | null;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export function IdeasProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [globalIdeas, setGlobalIdeas] = useState<Idea[]>([]);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteStatus, setVoteStatus] = useState<{ votes_remaining: number; votes_reset_at: string; weekly_vote_limit: number } | null>(null);
  const { user, emailVerified } = useAuth();

  const updateIdea = async (id: string, data: UpdateIdeaData) => {
    if (!user) {
      throw new Error('You must be logged in to update an idea');
    }

    try {
      const { error, data: updatedIdea } = await supabase
        .from('ideas')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updateIdeasArray = (prevIdeas: Idea[]) =>
        prevIdeas.map(idea => idea.id === id ? { ...idea, ...updatedIdea } : idea);

      setIdeas(updateIdeasArray);
      setGlobalIdeas(updateIdeasArray);
      setUserIdeas(updateIdeasArray);

      toast.success('Idea updated successfully!');
    } catch (error: any) {
      console.error('Error updating idea:', error);
      toast.error(error.message || 'Error updating idea');
    }
  };

  const createIdea = async (data: CreateIdeaData) => {
    if (!user) {
      throw new Error('You must be logged in to create an idea');
    }

    try {
      const { error, data: newIdea } = await supabase
        .from('ideas')
        .insert([{
          ...data,
          user_id: user.id,
        }])
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      if (error) throw error;

      const ideaWithAuthor = {
        ...newIdea,
        author_name: data.is_anonymous ? null : newIdea.profiles?.name
      };

      setIdeas(prevIdeas => [ideaWithAuthor, ...prevIdeas]);
      setGlobalIdeas(prevIdeas => [ideaWithAuthor, ...prevIdeas]);
      setUserIdeas(prevIdeas => [ideaWithAuthor, ...prevIdeas]);

      toast.success(data.is_official_proposal ? 'Official proposal created successfully!' : 'Idea created successfully!');
    } catch (error: any) {
      console.error('Error creating idea:', error);
      
      // Handle specific email verification error
      if (error.message?.includes('EMAIL_NOT_VERIFIED') || error.message?.includes('verify your email')) {
        throw new Error('Please verify your email address before creating ideas');
      }
      
      throw new Error(error.message || 'Error creating idea');
    }
  };

  const deleteIdea = async (id: string) => {
    if (!user) return;
    
    try {
      const { error, status } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (status === 403) {
          throw new Error('You do not have permission to delete this idea');
        }
        throw error;
      }

      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
      setGlobalIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
      setUserIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));

      toast.success('Idea deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting idea:', error);
      toast.error(error.message || 'Error deleting idea');
      
      await Promise.all([
        fetchIdeas(),
        fetchGlobalIdeas(),
        fetchUserIdeas()
      ]);
    }
  };

  const voteOnIdea = async (ideaId: string, voteType: 'up' | 'down') => {
    if (!user) {
      throw new Error('You must be logged in to vote');
    }

    try {
      // Optimistically update the UI
      const updateIdeaInList = (prevIdeas: Idea[]) =>
        prevIdeas.map(idea => {
          if (idea.id === ideaId) {
            const isChangingVote = idea.user_vote && idea.user_vote !== voteType;
            const isRemovingVote = idea.user_vote === voteType;
            
            let newUpvotes = idea.upvotes;
            let newDownvotes = idea.downvotes;
            
            // Remove existing vote if any
            if (idea.user_vote === 'up') newUpvotes--;
            if (idea.user_vote === 'down') newDownvotes--;
            
            // Add new vote if not removing
            if (!isRemovingVote) {
              if (voteType === 'up') newUpvotes++;
              if (voteType === 'down') newDownvotes++;
            }

            return {
              ...idea,
              upvotes: Math.max(0, newUpvotes),
              downvotes: Math.max(0, newDownvotes),
              user_vote: isRemovingVote ? null : voteType
            };
          }
          return idea;
        });

      setIdeas(updateIdeaInList);
      setGlobalIdeas(updateIdeaInList);
      setUserIdeas(updateIdeaInList);

      // Make the API call
      const { data: result, error } = await supabase
        .rpc('increment_vote', {
          p_idea_id: ideaId,
          p_vote_type: voteType
        });

      if (error) throw error;

      if (!result || !result.success) {
        // Handle specific email verification error
        if (result?.error_code === 'EMAIL_NOT_VERIFIED') {
          throw new Error('Please verify your email address before voting');
        }
        throw new Error(result?.message || 'Failed to process vote');
      }

      // Update vote status with the new votes remaining
      if (result.new_votes_remaining_this_week !== undefined) {
        setVoteStatus(prevStatus => ({
          ...prevStatus!,
          votes_remaining: result.new_votes_remaining_this_week
        }));
      }

      toast.success(result.message || 'Vote recorded successfully!');
    } catch (error: any) {
      console.error('Error voting on idea:', error);
      
      // Handle specific email verification error
      if (error.message?.includes('EMAIL_NOT_VERIFIED') || error.message?.includes('verify your email')) {
        toast.error('Please verify your email address before voting');
      } else {
        toast.error(error.message || 'Error recording vote');
      }
      
      // Revert optimistic update on error
      await Promise.all([
        fetchIdeas(),
        fetchGlobalIdeas(),
        fetchUserIdeas()
      ]);
      
      throw error;
    }
  };

  const fetchIdeas = async (location?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('ideas')
        .select(`
          *,
          profiles (
            name
          ),
          votes (
            vote_type
          )
        `)
        .order('created_at', { ascending: false });

      if (location) {
        query = query.eq('location', location);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedIdeas = data?.map(idea => ({
        ...idea,
        author_name: idea.is_anonymous ? null : idea.profiles?.name,
        user_vote: idea.votes?.[0]?.vote_type || null
      })) || [];

      setIdeas(processedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          profiles (
            name
          ),
          votes (
            vote_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedIdeas = data?.map(idea => ({
        ...idea,
        author_name: idea.is_anonymous ? null : idea.profiles?.name,
        user_vote: idea.votes?.[0]?.vote_type || null
      })) || [];

      setGlobalIdeas(processedIdeas);
    } catch (error) {
      console.error('Error fetching global ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserIdeas = async () => {
    if (!user) {
      setUserIdeas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          profiles (
            name
          ),
          votes (
            vote_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedIdeas = data?.map(idea => ({
        ...idea,
        author_name: idea.is_anonymous ? null : idea.profiles?.name,
        user_vote: idea.votes?.[0]?.vote_type || null
      })) || [];

      setUserIdeas(processedIdeas);
    } catch (error) {
      console.error('Error fetching user ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vote status when user changes
  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (!user || !emailVerified) {
        setVoteStatus(null);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('votes_remaining, votes_reset_at, weekly_vote_limit')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          setVoteStatus({
            votes_remaining: profile.votes_remaining,
            votes_reset_at: profile.votes_reset_at,
            weekly_vote_limit: profile.weekly_vote_limit
          });
        } else {
          setVoteStatus(null);
        }
      } catch (error) {
        console.error('Error fetching vote status:', error);
        setVoteStatus(null);
      }
    };

    fetchVoteStatus();
  }, [user]);

  // Fetch ideas when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        return;
      }
      
      setLoading(true);
      try {
        await Promise.all([
          fetchIdeas(),
          fetchGlobalIdeas(),
          fetchUserIdeas()
        ]);
      } catch (error) {
        console.error('Error loading ideas data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, emailVerified]);

  return (
    <IdeasContext.Provider value={{
      ideas,
      globalIdeas,
      userIdeas,
      loading,
      deleteIdea,
      createIdea,
      updateIdea,
      fetchIdeas,
      fetchGlobalIdeas,
      fetchUserIdeas,
      voteOnIdea,
      voteStatus
    }}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const context = useContext(IdeasContext);
  if (context === undefined) {
    throw new Error('useIdeas must be used within an IdeasProvider');
  }
  return context;
}