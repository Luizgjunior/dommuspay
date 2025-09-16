#!/bin/bash

# Script de Deploy para Vercel
echo "🚀 Iniciando deploy para Vercel..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado
if ! vercel whoami &> /dev/null; then
    echo "🔑 Faça login na Vercel..."
    vercel login
fi

# Verificar variáveis de ambiente
echo "🔍 Verificando variáveis de ambiente..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não configurada. Configure no dashboard da Vercel."
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET não configurada. Configure no dashboard da Vercel."
fi

# Deploy
echo "📦 Fazendo deploy..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://seu-projeto.vercel.app"
echo "🔧 Configure as variáveis de ambiente no dashboard da Vercel"
