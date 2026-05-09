export interface Profile {
  id: string;
  username: string;
  bio: string;
  created_at: string;
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
