# 🚀 Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Conta no NeonDB**: [neon.tech](https://neon.tech)
3. **GitHub/GitLab/Bitbucket** (repositório do projeto)
4. **Node.js 18+** instalado localmente

## 🔧 Configuração Inicial

### **1. Preparar Repositório**

```bash
# Inicializar Git (se não existir)
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "feat: sistema controle financeiro para Vercel"

# Conectar ao repositório remoto
git remote add origin https://github.com/seu-usuario/controle-financeiro.git
git push -u origin main
```

### **2. Configurar NeonDB**

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Crie um novo projeto
3. Copie a **DATABASE_URL**
4. Anote as credenciais

### **3. Deploy na Vercel**

#### **Opção A: Via Dashboard (Recomendado)**

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"New Project"**
3. Conecte seu repositório GitHub
4. Configure o projeto:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `/` (raiz)

#### **Opção B: Via CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy de produção
vercel --prod
```

## 🔑 Configurar Variáveis de Ambiente

### **No Dashboard Vercel:**

1. Vá em **Settings** → **Environment Variables**
2. Adicione as variáveis:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview, Development |
| `JWT_SECRET` | `sua-chave-secreta` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production, Preview, Development |
| `FRONTEND_URL` | `https://seu-projeto.vercel.app` | Production, Preview, Development |

### **Via CLI:**

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add FRONTEND_URL
```

## 🗄️ Inicializar Banco de Dados

### **1. Conectar ao NeonDB**

```bash
# Instalar psql (PostgreSQL client)
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Conectar
psql "sua-database-url-aqui"
```

### **2. Executar Script de Inicialização**

```sql
-- Copie e cole o conteúdo de backend/database/init-postgres.sql
-- Ou execute via Node.js:

node backend/database/init.js
```

## 🧪 Testar Deploy

### **1. Verificar URLs**

- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api/health`
- **Login**: `https://seu-projeto.vercel.app/api/auth/demo`

### **2. Testar Funcionalidades**

1. ✅ Acesse a URL do projeto
2. ✅ Faça login com usuário demo
3. ✅ Adicione uma transação
4. ✅ Verifique gráficos
5. ✅ Teste navegação entre telas

## 🔄 Atualizações

### **Deploy Automático**

- Push para `main` → Deploy automático
- Push para outras branches → Preview

### **Deploy Manual**

```bash
# Via CLI
vercel --prod

# Via Dashboard
- Vá em Deployments
- Clique em "Redeploy"
```

## 🐛 Troubleshooting

### **Erro de Build**

```bash
# Verificar logs
vercel logs

# Build local
npm run build
```

### **Erro de Conexão com Banco**

1. Verifique `DATABASE_URL`
2. Teste conexão no NeonDB
3. Verifique SSL settings

### **Erro 500**

1. Verifique logs da Vercel
2. Teste API endpoints
3. Verifique variáveis de ambiente

### **Erro de CORS**

1. Verifique `FRONTEND_URL`
2. Configure CORS no server.js
3. Teste em diferentes navegadores

## 📊 Monitoramento

### **Vercel Analytics**

1. Ative Analytics no dashboard
2. Monitore performance
3. Configure alertas

### **NeonDB Monitoring**

1. Acesse console do NeonDB
2. Monitore queries
3. Verifique uso de recursos

## 🚀 Otimizações

### **Performance**

- ✅ Use CDN da Vercel
- ✅ Configure cache headers
- ✅ Otimize imagens
- ✅ Minifique CSS/JS

### **Segurança**

- ✅ Use HTTPS
- ✅ Configure CORS
- ✅ Valide inputs
- ✅ Rate limiting

## 📈 Escalabilidade

### **Vercel Pro**

- **Bandwidth**: 1TB/mês
- **Function executions**: 1M/mês
- **Edge functions**: Ilimitadas
- **Custom domains**: Ilimitados

### **NeonDB Pro**

- **Storage**: 10GB
- **Connections**: 100 simultâneas
- **Backup**: 7 dias
- **Support**: 24/7

## 🎯 Próximos Passos

1. **Custom Domain**: Configure domínio próprio
2. **CI/CD**: Configure GitHub Actions
3. **Monitoring**: Configure alertas
4. **Backup**: Configure backup automático
5. **SSL**: Configure certificados

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **NeonDB Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Community**: [vercel.com/community](https://vercel.com/community)

---

**🎉 Parabéns! Seu sistema está no ar!** 🚀
