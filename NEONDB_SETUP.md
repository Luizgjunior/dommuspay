# 🚀 Configuração NeonDB - Guia Completo

## 📋 Pré-requisitos

1. **Conta no NeonDB**: [neon.tech](https://neon.tech)
2. **Node.js 16+** instalado
3. **Projeto configurado** com as dependências

## 🔧 Passos para Configuração

### **1. Criar Projeto no NeonDB**

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Clique em "Create Project"
3. Escolha um nome: `controle-financeiro`
4. Selecione a região mais próxima
5. Clique em "Create Project"

### **2. Obter String de Conexão**

1. No dashboard do NeonDB, vá em "Connection Details"
2. Copie a **Connection String** (DATABASE_URL)
3. Exemplo: `postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### **3. Configurar Variáveis de Ambiente**

1. **Copie** o arquivo `backend/config.env.example` para `backend/.env`
2. **Cole** sua DATABASE_URL no arquivo `.env`:

```bash
# Configurações do NeonDB (PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Configurações da aplicação
NODE_ENV=development
PORT=3000
JWT_SECRET=sua-chave-secreta-super-segura-aqui
FRONTEND_URL=http://localhost:5500
```

### **4. Instalar Dependências**

```bash
cd backend
npm install
```

### **5. Inicializar Banco de Dados**

```bash
npm run init-db
```

### **6. Iniciar Aplicação**

```bash
npm start
```

## ✅ Verificação

Se tudo estiver correto, você verá:

```
✅ Conectado ao NeonDB (PostgreSQL)
🕐 Timestamp do servidor: 2024-12-19 10:30:00.123456+00
🚀 Servidor rodando na porta 3000
📊 API disponível em: http://localhost:3000/api
🌐 Frontend disponível em: http://localhost:3000
💾 Banco de dados: PostgreSQL (NeonDB)
```

## 🔍 Troubleshooting

### **Erro de Conexão**
- Verifique se a DATABASE_URL está correta
- Confirme se o projeto NeonDB está ativo
- Teste a conexão no console do NeonDB

### **Erro de SSL**
- Adicione `?sslmode=require` na URL
- Verifique se `NODE_ENV=production` está configurado

### **Erro de Dependências**
- Execute `npm install` novamente
- Verifique se `pg` e `dotenv` estão instalados

## 📊 Vantagens do NeonDB

- ✅ **Serverless**: Escala automaticamente
- ✅ **PostgreSQL**: Banco robusto e confiável
- ✅ **Backup Automático**: Dados sempre seguros
- ✅ **Conexão Global**: Baixa latência
- ✅ **Free Tier**: 3GB gratuitos
- ✅ **Console Web**: Interface amigável

## 🚀 Deploy em Produção

1. Configure `NODE_ENV=production` no `.env`
2. Use a DATABASE_URL de produção
3. Configure variáveis no seu provedor de deploy
4. Execute `npm run init-db` no servidor

## 📞 Suporte

- **NeonDB Docs**: [neon.tech/docs](https://neon.tech/docs)
- **PostgreSQL Docs**: [postgresql.org/docs](https://postgresql.org/docs)
- **Issues**: Abra uma issue no repositório
