# 🔧 Variáveis de Ambiente - Vercel

## 📋 Variáveis Necessárias

Configure as seguintes variáveis no painel da Vercel:

### **1. DATABASE_URL**
```
postgresql://neondb_owner:npg_kFAY83PowTKy@ep-gentle-term-ae2o1akf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### **2. JWT_SECRET**
```
sua-chave-secreta-super-segura-para-producao
```

### **3. NODE_ENV**
```
production
```

### **4. FRONTEND_URL**
```
https://dommuspay.vercel.app
```

## 🚀 Como Configurar

### **Via Dashboard Vercel:**
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:
   - **Name**: `DATABASE_URL`
   - **Value**: Sua string de conexão do NeonDB
   - **Environment**: Production, Preview, Development

### **Via CLI Vercel:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Configurar variáveis
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add FRONTEND_URL
```

## 🔒 Segurança

- ✅ **Nunca** commite arquivos `.env`
- ✅ Use senhas fortes para JWT_SECRET
- ✅ Configure SSL no NeonDB
- ✅ Use HTTPS em produção

## 🧪 Teste Local

Para testar localmente com as variáveis de produção:

```bash
# Criar arquivo .env.local
echo "DATABASE_URL=sua_url_aqui" > .env.local
echo "JWT_SECRET=sua_chave_aqui" >> .env.local
echo "NODE_ENV=production" >> .env.local

# Executar
npm run dev
```
