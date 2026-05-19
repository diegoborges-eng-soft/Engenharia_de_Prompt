export interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url?: string;
  banner_url?: string;
  is_verified?: boolean;
  website?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  emotion?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_repost?: boolean;
  original_post_id?: string;
  engagement_score?: number;
  profile?: Profile;
  likes_count?: number;
  comments_count?: number;
  is_liked_by_user?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  profile?: Profile;
  viewed?: boolean;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: Profile;
  receiver_profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  from_user_id?: string;
  post_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  from_user_profile?: Profile;
}

export interface Gamification {
  id: string;
  user_id: string;
  xp_total: number;
  level: number;
  current_xp: number;
  next_level_xp: number;
  coins: number;
  badges: string[];
  streak_days: number;
  last_login_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyMission {
  id: string;
  user_id: string;
  mission_type: string;
  title: string;
  description?: string;
  xp_reward: number;
  coin_reward: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  expires_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_posts: number;
  total_likes_received: number;
  total_comments_received: number;
  followers_count: number;
  following_count: number;
  total_stories: number;
  updated_at: string;
}

export interface Trending {
  id: string;
  hashtag: string;
  post_count: number;
  rank: number;
  updated_at: string;
}

export interface Thought {
  id: string;
  user_id: string;
  content: string;
  emotion: string | null;
  semantic_hash: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  emotional_tags?: EmotionalTag[];
}

export interface EmotionalTag {
  id: string;
  thought_id: string;
  emotion: string;
  confidence: number;
  created_at: string;
}

export interface UserConnection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  compatibility_score: number;
  reason: string | null;
  created_at: string;
  profile_a?: Profile;
  profile_b?: Profile;
}

export interface ConversationRoom {
  id: string;
  topic: string;
  description: string | null;
  theme: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  member_count?: number;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}
