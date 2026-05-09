/*
  # MENTE COLETIVA - Schema Principal

  1. Novas Tabelas
    - `profiles`: Perfis de usuários
    - `thoughts`: Pensamentos dos usuários
    - `emotional_tags`: Tags de emoção detectadas
    - `user_connections`: Conexões cognitivas entre usuários
    - `conversation_rooms`: Salas automáticas de conversas
    - `room_members`: Membros das salas
    - `room_messages`: Mensagens nas salas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários acessarem apenas seus próprios dados
    - Políticas para salas compartilhadas
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver perfis públicos"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Thoughts
CREATE TABLE IF NOT EXISTS thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  emotion text,
  semantic_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver todos os pensamentos"
  ON thoughts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar pensamentos"
  ON thoughts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios pensamentos"
  ON thoughts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios pensamentos"
  ON thoughts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Emotional Tags
CREATE TABLE IF NOT EXISTS emotional_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid NOT NULL REFERENCES thoughts(id) ON DELETE CASCADE,
  emotion text NOT NULL,
  confidence float DEFAULT 0.8,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emotional_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver tags emocionais"
  ON emotional_tags FOR SELECT
  TO authenticated
  USING (true);

-- User Connections
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score float DEFAULT 0.5,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas conexões"
  ON user_connections FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

-- Conversation Rooms
CREATE TABLE IF NOT EXISTS conversation_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  description text,
  theme text DEFAULT 'default',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE conversation_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver salas ativas"
  ON conversation_rooms FOR SELECT
  TO authenticated
  USING (is_active = true AND expires_at > now());

-- Room Members
CREATE TABLE IF NOT EXISTS room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES conversation_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver membros de salas ativas"
  ON room_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_rooms
      WHERE conversation_rooms.id = room_members.room_id
      AND is_active = true
    )
  );

CREATE POLICY "Usuários podem se juntar a salas"
  ON room_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Room Messages
CREATE TABLE IF NOT EXISTS room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES conversation_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens de salas ativas"
  ON room_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_rooms
      WHERE conversation_rooms.id = room_messages.room_id
      AND is_active = true
    )
  );

CREATE POLICY "Usuários podem enviar mensagens em salas"
  ON room_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_messages.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thoughts_emotion ON thoughts(emotion);
CREATE INDEX IF NOT EXISTS idx_emotional_tags_thought_id ON emotional_tags(thought_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_a ON user_connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_b ON user_connections(user_b_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_created_at ON room_messages(created_at DESC);
