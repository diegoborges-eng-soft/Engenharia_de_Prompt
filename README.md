# MENTE COLETIVA

Uma rede social futurista de pensamentos rápidos onde usuários registram ideias, emoções, dúvidas e reflexões em poucos segundos.

## Sobre

MENTE COLETIVA conecta pensadores através de uma análise semântica inteligente de pensamentos, detectando emoções, encontrando compatibilidades cognitivas e criando salas automáticas de conversa.

### Recursos Principais

- **Compartilhamento de Pensamentos**: Registre seus pensamentos em até 280 caracteres
- **Análise Emocional**: IA detecta automaticamente 10 diferentes estados emocionais
- **Matching Cognitivo**: Encontre pessoas compatíveis com você baseado em padrões emocionais
- **Salas Automáticas**: Grupos de conversa criados automaticamente por tema emocional
- **Feed Neural em Realtime**: Veja pensamentos enquanto são compartilhados
- **Sem Métricas Públicas**: Sem likes, followers ou números públicos - apenas conexão genuína

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Animações**: Framer Motion
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Edge Functions**: Para análise semântica e matching
- **Autenticação**: Supabase Auth (Email/Senha)

## Design Visual

- Dark Mode cinematográfico inspirado em Black Mirror
- Minimalista e extremamente fluido
- Glow neon azul suave
- Partículas animadas
- Glassmorphism
- Animações suaves com Framer Motion

## Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (já configurada)

### Instalação

```bash
npm install
npm run dev
```

O servidor estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Auth.tsx        # Autenticação
│   ├── HomePage.tsx    # Página principal
│   ├── ThoughtInput.tsx # Input de pensamentos
│   ├── NeuralFeed.tsx  # Feed em realtime
│   ├── CognitiveMatching.tsx # Compatibilidade
│   ├── AutomaticRooms.tsx # Salas automáticas
│   └── EmotionalInsights.tsx # Insights emocionais
├── hooks/              # React Hooks customizados
├── lib/                # Utilitários e APIs
├── types/              # TypeScript types
└── App.tsx            # Componente raiz
```

## Banco de Dados

Tabelas principais:
- `profiles` - Perfis de usuários
- `thoughts` - Pensamentos compartilhados
- `emotional_tags` - Emoções detectadas
- `user_connections` - Compatibilidades entre usuários
- `conversation_rooms` - Salas de conversa
- `room_members` - Participantes das salas
- `room_messages` - Mensagens nas salas

## Edge Functions

Três funções serverless que processam dados:

1. **analyze_thought** - Analisa emoções dos pensamentos
2. **find_matches** - Encontra usuários compatíveis
3. **create_room** - Cria salas automáticas

## Autenticação

- Email e senha
- Sem confirmação de email
- Gerenciado por Supabase Auth
- Row Level Security habilitado em todas as tabelas

## Desenvolvedor

Desenvolvido como um conceito futurista de rede social focada em conexões intelectuais e emocionais genuínas.

---

**MENTE COLETIVA** © 2024 - Conectando pensadores além das métricas
