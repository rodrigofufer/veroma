import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeasContext';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Ban, 
  UserCheck, 
  UserX, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Crown, 
  FileText, 
  Calendar, 
  BarChart3, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Star,
  MessageSquare,
  Bell,
  Activity,
  TrendingUp,
  Database,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  role: 'user' | 'representative' | 'administrator' | 'authority';
  strikes: number;
  is_banned: boolean;
  created_at: string;
  email_confirmed_at: string | null;
  votes_remaining: number;
  weekly_vote_limit: number;
}

interface AuditLogEntry {
  id: string;
  actor_user_id: string | null;
  actor_name: string | null;
  action_type: 'INSERT' | 'UPDATE' | 'DELETE';
  target_entity_type: string;
  target_entity_id: string | null;
  details: any;
  created_at: string;
}

interface AdminStats {
  total_users: number;
  banned_users: number;
  users_by_role: Record<string, number>;
  total_ideas: number;
  official_proposals: number;
  total_votes: number;
}

export default function AdminDashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const { globalIdeas, updateIdea, deleteIdea, fetchGlobalIdeas } = useIdeas();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters and search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [auditEntityFilter, setAuditEntityFilter] = useState('all');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  
  // UI state
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [editingIdea, setEditingIdea] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  // Check if user is admin
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      if (role !== 'administrator') {
        toast.error('Access denied. Administrator privileges required.');
        navigate('/dashboard');
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchUsers(),
        fetchAdminStats(),
        fetchAuditLogs(),
        fetchGlobalIdeas()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user, role, authLoading, navigate]);

  // Fetch functions
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchAdminStats = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_user_stats');
      
      if (error) throw error;
      
      if (data?.success) {
        setAdminStats(data.data);
      } else {
        throw new Error(data?.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase.rpc('get_audit_logs', {
        p_limit: 100,
        p_offset: 0
      });

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  // Admin actions
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('admin_change_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        await fetchUsers();
        await fetchAuditLogs();
      } else {
        throw new Error(data?.message || 'Failed to change role');
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error(error.message || 'Failed to change user role');
    }
  };

  const handleAssignStrike = async (userId: string) => {
    if (!window.confirm('Are you sure you want to assign a strike to this user?')) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('assign_strike', {
        p_user_id: userId
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        await fetchUsers();
        await fetchAuditLogs();
      } else {
        throw new Error(data?.message || 'Failed to assign strike');
      }
    } catch (error) {
      console.error('Error assigning strike:', error);
      toast.error(error.message || 'Failed to assign strike');
    }
  };

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_status: !currentlyBanned,
        reason: `${action} by administrator`
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        await fetchUsers();
        await fetchAuditLogs();
      } else {
        throw new Error(data?.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(error.message || `Failed to ${action} user`);
    }
  };

  const handleSendNotification = async (userId: string) => {
    const message = window.prompt('Enter notification message:');
    if (!message) return;

    try {
      const { data, error } = await supabase.rpc('send_system_notification', {
        p_user_id: userId,
        p_message: message
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Notification sent successfully');
      } else {
        throw new Error(data?.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  const handleEditIdea = async (ideaId: string) => {
    try {
      await updateIdea(ideaId, {
        title: editForm.title,
        description: editForm.description
      });
      
      setEditingIdea(null);
      setEditForm({ title: '', description: '' });
      toast.success('Idea updated successfully');
      await fetchGlobalIdeas();
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea');
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteIdea(ideaId);
      toast.success('Idea deleted successfully');
      await fetchGlobalIdeas();
      await fetchAuditLogs();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  const handleMarkAsOfficial = async (ideaId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'remove official status from' : 'mark as official';
    if (!window.confirm(`Are you sure you want to ${action} this idea?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ideas')
        .update({ is_official_proposal: !currentStatus })
        .eq('id', ideaId);

      if (error) throw error;

      toast.success(`Idea ${currentStatus ? 'unmarked as' : 'marked as'} official proposal`);
      await fetchGlobalIdeas();
      await fetchAuditLogs();
    } catch (error) {
      console.error('Error updating official status:', error);
      toast.error('Failed to update official status');
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesEntity = auditEntityFilter === 'all' || log.target_entity_type === auditEntityFilter;
    const matchesAction = auditActionFilter === 'all' || log.action_type === auditActionFilter;
    return matchesEntity && matchesAction;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'authority': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'administrator': return 'bg-red-100 text-red-800 border-red-200';
      case 'representative': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-800 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
        <Footer />
        <BoltBadge />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-8 w-8 text-blue-800 mr-3" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage users, content, and monitor platform activity
                </p>
              </div>
              <button
                onClick={() => {
                  Promise.all([
                    fetchUsers(),
                    fetchAdminStats(),
                    fetchAuditLogs(),
                    fetchGlobalIdeas()
                  ]);
                  toast.success('Data refreshed');
                }}
                className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content Moderation
              </TabsTrigger>
              <TabsTrigger value="audit">
                <Activity className="h-4 w-4 mr-2" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                {adminStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{adminStats.total_users}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {adminStats.banned_users} banned
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium">Total Ideas</h3>
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{adminStats.total_ideas}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {adminStats.official_proposals} official
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium">Total Votes</h3>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{adminStats.total_votes}</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium">Audit Entries</h3>
                        <Database className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{auditLogs.length}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Last 100 entries
                      </div>
                    </div>
                  </div>
                )}

                {/* Users by Role */}
                {adminStats?.users_by_role && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(adminStats.users_by_role).map(([role, count]) => (
                        <div key={role} className="text-center">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(role)}`}>
                            {role}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mt-2">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="representative">Representative</option>
                        <option value="administrator">Administrator</option>
                        <option value="authority">Authority</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Strikes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((userData) => (
                          <tr key={userData.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {userData.email}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {userData.country}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(userData.role)}`}>
                                {userData.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {userData.is_banned ? (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Banned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${userData.strikes >= 3 ? 'text-red-600' : userData.strikes >= 2 ? 'text-orange-600' : 'text-gray-900'}`}>
                                {userData.strikes}/3
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(userData.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <select
                                  value={userData.role}
                                  onChange={(e) => handleChangeUserRole(userData.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  disabled={userData.id === user?.id}
                                >
                                  <option value="user">User</option>
                                  <option value="representative">Representative</option>
                                  <option value="administrator">Administrator</option>
                                  <option value="authority">Authority</option>
                                </select>
                                
                                <button
                                  onClick={() => handleAssignStrike(userData.id)}
                                  disabled={userData.id === user?.id || userData.is_banned}
                                  className="p-1 text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Assign Strike"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleBanUser(userData.id, userData.is_banned)}
                                  disabled={userData.id === user?.id}
                                  className={`p-1 ${userData.is_banned ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                  title={userData.is_banned ? 'Unban User' : 'Ban User'}
                                >
                                  {userData.is_banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                </button>
                                
                                <button
                                  onClick={() => handleSendNotification(userData.id)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Send Notification"
                                >
                                  <Bell className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Content Moderation Tab */}
            <TabsContent value="content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ideas Management</h3>
                    <p className="text-gray-600 mt-1">Review and moderate platform content</p>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {globalIdeas.map((idea) => (
                      <div key={idea.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                idea.type === 'proposal' ? 'bg-blue-100 text-blue-800' :
                                idea.type === 'complaint' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {idea.type}
                              </span>
                              {idea.is_official_proposal && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Official
                                </span>
                              )}
                            </div>
                            
                            {editingIdea === idea.id ? (
                              <div className="space-y-4">
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditIdea(idea.id)}
                                    className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingIdea(null);
                                      setEditForm({ title: '', description: '' });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">{idea.title}</h4>
                                <p className={`text-gray-600 ${expandedIdea === idea.id ? '' : 'line-clamp-3'}`}>
                                  {idea.description}
                                </p>
                                {idea.description.length > 200 && (
                                  <button
                                    onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                                    className="text-blue-600 text-sm mt-2 hover:text-blue-800"
                                  >
                                    {expandedIdea === idea.id ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                              </>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                              <span>By: {idea.is_anonymous ? 'Anonymous' : idea.author_name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(idea.created_at)}</span>
                              <span>•</span>
                              <span>{idea.upvotes - idea.downvotes} votes</span>
                              <span>•</span>
                              <span>{idea.location_value}, {idea.country}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingIdea(idea.id);
                                setEditForm({ title: idea.title, description: idea.description });
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                              title="Edit Idea"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleMarkAsOfficial(idea.id, idea.is_official_proposal)}
                              className={`p-2 rounded-lg ${
                                idea.is_official_proposal 
                                  ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                              }`}
                              title={idea.is_official_proposal ? 'Remove Official Status' : 'Mark as Official'}
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteIdea(idea.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                              title="Delete Idea"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div>
                      <select
                        value={auditEntityFilter}
                        onChange={(e) => setAuditEntityFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Entities</option>
                        <option value="ideas">Ideas</option>
                        <option value="profiles">Profiles</option>
                        <option value="votes">Votes</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Actions</option>
                        <option value="INSERT">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Audit Log */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
                    <p className="text-gray-600 mt-1">Track all system changes and administrative actions</p>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredAuditLogs.map((log) => (
                      <div key={log.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.action_type === 'INSERT' ? 'bg-green-100 text-green-800' :
                                log.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {log.action_type}
                              </span>
                              <span className="text-sm text-gray-600">{log.target_entity_type}</span>
                            </div>
                            
                            <div className="text-sm text-gray-900 mb-2">
                              <strong>Actor:</strong> {log.actor_name || 'System'}
                            </div>
                            
                            {log.details && (
                              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 ml-4">
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
      <BoltBadge />
    </div>
  );
}