# Arquitetura Técnica - MENTE COLETIVA

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (React + Vite)                    │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │     Auth     │  HomePage    │  Components  │             │
│  └──────────────┴──────────────┴──────────────┘             │
│         │              │              │                     │
└─────────┼──────────────┼──────────────┼─────────────────────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
    ┌─────────────┐           ┌───────────────────┐
    │ Supabase    │           │  Edge Functions   │
    │   Auth      │           │  - analyze_thought│
    └─────────────┘           │  - find_matches   │
        │                     │  - create_room    │
        │                     └───────────────────┘
        │                              │
        └──────────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Supabase Database  │
            │   (PostgreSQL)       │
            └──────────────────────┘
            ┌──────────────────────┐
            │  Realtime (WebSocket)│
            └──────────────────────┘
```

## Stack Técnico

### Frontend
- **React 18.3** - UI Framework
- **TypeScript 5.5** - Type Safety
- **Vite 5.4** - Build Tool
- **Tailwind CSS 3.4** - Styling
- **Framer Motion 11** - Animations
- **Lucide React 0.344** - Icons

### Backend
- **Supabase PostgreSQL** - Database
- **Supabase Auth** - Authentication
- **Supabase Realtime** - WebSocket
- **Deno Edge Functions** - Serverless

### DevTools
- **ESLint** - Linting
- **TypeScript Compiler** - Type Checking
- **Vite Preview** - Production Preview

## Estrutura de Banco de Dados

### Tabelas Principais

```sql
profiles
├── id (uuid, PK)
├── username (text, UNIQUE)
├── bio (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

thoughts
├── id (uuid, PK)
├── user_id (uuid, FK -> profiles)
├── content (text)
├── emotion (text)
├── semantic_hash (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

emotional_tags
├── id (uuid, PK)
├── thought_id (uuid, FK -> thoughts)
├── emotion (text)
├── confidence (float)
└── created_at (timestamptz)

user_connections
├── id (uuid, PK)
├── user_a_id (uuid, FK -> auth.users)
├── user_b_id (uuid, FK -> auth.users)
├── compatibility_score (float)
├── reason (text)
└── created_at (timestamptz)

conversation_rooms
├── id (uuid, PK)
├── topic (text)
├── description (text)
├── theme (text)
├── is_active (boolean)
├── created_at (timestamptz)
└── expires_at (timestamptz)

room_members
├── id (uuid, PK)
├── room_id (uuid, FK -> conversation_rooms)
├── user_id (uuid, FK -> auth.users)
└── joined_at (timestamptz)

room_messages
├── id (uuid, PK)
├── room_id (uuid, FK -> conversation_rooms)
├── user_id (uuid, FK -> auth.users)
├── content (text)
└── created_at (timestamptz)
```

## Fluxo de Dados

### 1. Compartilhamento de Pensamento

```
User Input
    ↓
ThoughtInput Component
    ↓
supabase.from('thoughts').insert()
    ↓
Database: INSERT thoughts
    ↓
Edge Function: analyze_thought (async)
    ├── Analisa emoção
    ├── INSERT emotional_tags
    └── UPDATE thought.emotion
    ↓
Edge Function: find_matches (async)
    ├── Busca pensamentos similares
    ├── Calcula compatibilidade
    └── INSERT/UPDATE user_connections
    ↓
Edge Function: create_room (async)
    ├── Cria sala automática
    └── INSERT conversation_rooms
    ↓
Realtime: Broadcast INSERT
    ↓
NeuralFeed: Re-render com novo thought
```

### 2. Autenticação

```
Auth Component (Sign Up)
    ↓
supabase.auth.signUp()
    ↓
Database: INSERT auth.users
    ↓
Insert profiles (trigger ou manual)
    ↓
supabase.auth.signInWithPassword()
    ↓
Session created
    ↓
App: Render HomePage
```

### 3. Realtime Subscription

```
Component Mount
    ↓
supabase.channel('thoughts_realtime').on(INSERT)
    ↓
Realtime Server: WebSocket Connection
    ↓
Database Changes
    ↓
Broadcast to Connected Clients
    ↓
Component State Update
    ↓
Re-render com animações
```

## Edge Functions

### analyze_thought

```typescript
Request: POST /functions/v1/analyze_thought
Body: { thoughtId, content }

Response: 
{
  emotion: string,
  confidence: number,
  tags: string[]
}

Flow:
1. Recebe thoughtId e content
2. Análise semântica (keyword-based)
3. Detecta emoção principal
4. UPDATE thoughts.emotion
5. INSERT emotional_tags
```

### find_matches

```typescript
Request: POST /functions/v1/find_matches
Body: { userId }

Response:
{
  matches: [
    {
      userId: string,
      compatibility: number,
      reason: string
    }
  ]
}

Flow:
1. Busca pensamentos do usuário
2. Extrai emoções detectadas
3. Busca outros usuários com emoções similares
4. Calcula score de compatibilidade
5. INSERT user_connections
6. Retorna top 10 matches
```

### create_room

```typescript
Request: POST /functions/v1/create_room
Body: { emotion?, topic? }

Response:
{
  id: uuid,
  topic: string,
  description: string,
  ...
}

Flow:
1. Recebe emoção (opcional)
2. Mapeia emoção para topic/description
3. Define expires_at = now + 24h
4. INSERT conversation_rooms
5. Retorna room data
```

## Segurança

### Authentication
- Supabase Auth maneja login/logout
- JWT tokens com expiração
- Session gerenciada via cookies

### Row Level Security

```sql
-- Profiles: Públicos para leitura, privado para escrita
SELECT: USING (true)
INSERT/UPDATE: USING (auth.uid() = id)

-- Thoughts: Públicos para leitura, privado para escrita/delete
SELECT: USING (true)
INSERT: USING (auth.uid() = user_id)
UPDATE/DELETE: USING (auth.uid() = user_id)

-- Connections: Privados entre dois usuários
SELECT: USING (
  auth.uid() = user_a_id OR auth.uid() = user_b_id
)

-- Rooms & Messages: Acesso para membros
SELECT/INSERT: Verificação de membership
```

### Input Validation
- Limite de 280 caracteres em thoughts
- Email validation no signup
- Password requirements
- Rate limiting implícito via RLS

## Performance

### Otimizações

1. **Índices**
   - thoughts(user_id)
   - thoughts(created_at DESC)
   - thoughts(emotion)
   - emotional_tags(thought_id)
   - user_connections(user_a_id, user_b_id)
   - room_members(room_id, user_id)
   - room_messages(room_id, created_at DESC)

2. **Queries**
   - SELECT limitado a 50 pensamentos
   - Realtime apenas para novos pensamentos
   - Lazy loading de dados adicionais

3. **Frontend**
   - Code splitting automático
   - Lazy loading de componentes
   - Memoização com Framer Motion
   - CSS-in-JS com Tailwind (purged)

### Bundle Size
- CSS: 3.95 KB (gzipped)
- JS: 130.13 KB (gzipped)
- Total: 134 KB initial load

## Escalabilidade

### Horizontal
- Supabase escala automaticamente
- Edge Functions distribuídas globalmente
- CDN para assets estáticos

### Vertical
- PostgreSQL aguenta milhões de linhas
- RLS não impacta performance significativamente
- Realtime escalável com Deno runtime

### Limitações
- Free tier Supabase: 500MB storage, 2GB bandwidth
- Upgrade se necessário: Pro (25$/mês) ou Enterprise

## Monitoramento

### Logs
- Supabase Dashboard: logs de queries
- Edge Functions: logs de execução
- Browser Console: logs do cliente

### Métricas
- Lighthouse Score
- Core Web Vitals
- Database query times
- Realtime latency

## Deployment

### CI/CD
- Deploy automático em merge
- Tests (apenas linting agora)
- Build verification

### Rollback
- Versionar banco de dados
- Manter backups regulares
- Testar em staging antes

---

**MENTE COLETIVA** - Construído com foco em performance, segurança e escalabilidade.
