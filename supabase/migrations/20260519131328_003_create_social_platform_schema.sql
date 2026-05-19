/*
  # Schema Completo da Plataforma Social

  1. Novas Tabelas
    - `posts`: Posts de usuários com conteúdo
    - `likes`: Sistema de curtidas
    - `comments`: Sistema de comentários
    - `follows`: Sistema de seguidores
    - `stories`: Stories de 24 horas
    - `direct_messages`: Mensagens privadas
    - `notifications`: Notificações em tempo real
    - `gamification`: XP, níveis, badges
    - `daily_missions`: Missões diárias
    - `user_stats`: Estatísticas do usuário
    - `trending`: Tendências do momento

  2. Segurança: RLS em todas as tabelas
  3. Performance: Índices otimizados
*/

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  media_type text,
  emotion text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_pinned boolean DEFAULT false,
  is_repost boolean DEFAULT false,
  original_post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  engagement_score integer DEFAULT 0
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver posts"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Criar posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editar próprios posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Deletar próprios posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver curtidas"
  ON likes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Curtir posts"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Remover curtida"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver comentários"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Comentar em posts"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editar próprios comentários"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Deletar próprios comentários"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver seguidores"
  ON follows FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Seguir usuários"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Deixar de seguir"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text DEFAULT 'image',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver stories válidos"
  ON stories FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

CREATE POLICY "Criar stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Direct Messages
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprias mensagens"
  ON direct_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Enviar mensagens"
  ON direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprias notificações"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Gamification
CREATE TABLE IF NOT EXISTS gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total integer DEFAULT 0,
  level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  next_level_xp integer DEFAULT 100,
  coins integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  streak_days integer DEFAULT 0,
  last_login_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver gamification"
  ON gamification FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Atualizar própria gamification"
  ON gamification FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily Missions
CREATE TABLE IF NOT EXISTS daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_type text NOT NULL,
  title text NOT NULL,
  description text,
  xp_reward integer DEFAULT 10,
  coin_reward integer DEFAULT 5,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at date DEFAULT CURRENT_DATE,
  expires_at date DEFAULT (CURRENT_DATE + interval '1 day'),
  UNIQUE(user_id, mission_type, created_at)
);

ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprias missões"
  ON daily_missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Atualizar próprias missões"
  ON daily_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Stats
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_posts integer DEFAULT 0,
  total_likes_received integer DEFAULT 0,
  total_comments_received integer DEFAULT 0,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  total_stories integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver stats"
  ON user_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- Trending
CREATE TABLE IF NOT EXISTS trending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag text NOT NULL UNIQUE,
  post_count integer DEFAULT 0,
  rank integer,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver trending"
  ON trending FOR SELECT
  TO anon, authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_level ON gamification(level DESC);
