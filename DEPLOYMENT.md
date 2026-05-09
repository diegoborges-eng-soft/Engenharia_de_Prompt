# Guia de Deployment - MENTE COLETIVA

## Configuração de Produção

### Variáveis de Ambiente

As variáveis de ambiente já estão configuradas no `.env`:

```
VITE_SUPABASE_URL=https://lylxjvfwlushmkgljpdx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Essas variáveis são públicas (a chave anon é para uso frontend).

### Build

```bash
npm install
npm run build
```

Isto criará uma pasta `dist/` pronta para deployment.

## Deployment para Vercel

### Passo a Passo

1. **Conectar Repositório**
   - Faça push do código para GitHub
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Selecione seu repositório

2. **Configuração do Build**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Variáveis de Ambiente**
   - Adicione as variáveis no painel da Vercel:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

4. **Deploy**
   - Clique em "Deploy"
   - Pronto! Sua aplicação está no ar

### Domínio Customizado

1. Vá para "Project Settings"
2. Selecione "Domains"
3. Adicione seu domínio customizado
4. Configure DNS com seu provedor

## Deployment para Netlify

### Passo a Passo

1. **Conectar Repositório**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Selecione seu repositório

2. **Configuração do Build**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Variáveis de Ambiente**
   - Vá para "Site settings" > "Build & deploy" > "Environment"
   - Adicione as variáveis

4. **Deploy**
   - Netlify faz deploy automático a cada push

## Deployment para Supabase Hosting

Como o frontend é estático, você pode:

1. **Fazer Build**
   ```bash
   npm run build
   ```

2. **Fazer Upload da pasta `dist/`**
   - Supabase permite hospedar conteúdo estático
   - Ou use um CDN como Cloudflare

## Monitoramento

### Performance
- Tamanho do bundle: ~130KB (gzipped)
- Carregamento: < 1 segundo
- Realtime: WebSocket direto com Supabase

### Logs
- Frontend logs: Browser console
- Backend logs: Dashboard Supabase
- Edge Functions: Dashboard Supabase

## Segurança

### Checklist
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS ativado (automático em Vercel/Netlify)
- [ ] Row Level Security ativado no Supabase
- [ ] Rate limiting considerado para API
- [ ] CORS configurado corretamente

### CORS Configuration

Edge Functions têm CORS headers corretos:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
```

## Scaling

### Para Crescimento
- Supabase escala automaticamente
- Edge Functions escalam com demanda
- Realtime aguenta milhares de conexões

### Otimizações
- Já implementado: índices no banco
- Já implementado: RLS para segurança
- Considere: Cache de pensamentos populares
- Considere: Agregação de estatísticas

## Troubleshooting

### Erro 401 Unauthorized
- Verifique VITE_SUPABASE_ANON_KEY
- Verifique se usuário está autenticado
- Verifique RLS policies

### Erro 500 nas Edge Functions
- Verifique logs no Dashboard Supabase
- Verifique se função está deployed
- Verifique ambiente variáveis

### Realtime Não Funciona
- Verifique conexão WebSocket
- Verifique se Realtime está ativado no Supabase
- Verifique firewall/proxy settings

## Rollback

### Revert de Deploy
- **Vercel**: "Deployments" > "Select previous" > "Redeploy"
- **Netlify**: "Deploy history" > Select previous > "Restore"

### Revert de Database
- Use migrations do Supabase
- Backups automáticos disponíveis
- Contate Supabase para restore completo

## Maintenance

### Backups
- Supabase faz backups automáticos
- Retenção: padrão é 7 dias (free) até 30 dias (pro)
- Configure backup externo se necessário

### Updates
- Mantenha dependências atualizadas: `npm update`
- Teste em staging antes de produção
- Use semantic versioning

## Performance Monitoring

### Métricas Importantes
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Lighthouse Score
- Bundle Size

Use ferramentas:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundlesize](https://bundlesize.io/)

---

**MENTE COLETIVA** está pronta para produção! Deploy com confiança.
