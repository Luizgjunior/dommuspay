@echo off
echo 🚀 Iniciando deploy para Vercel...

REM Verificar se Vercel CLI está instalado
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI não encontrado. Instalando...
    npm install -g vercel
)

REM Verificar se está logado
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔑 Faça login na Vercel...
    vercel login
)

REM Verificar variáveis de ambiente
echo 🔍 Verificando variáveis de ambiente...
if "%DATABASE_URL%"=="" (
    echo ⚠️  DATABASE_URL não configurada. Configure no dashboard da Vercel.
)

if "%JWT_SECRET%"=="" (
    echo ⚠️  JWT_SECRET não configurada. Configure no dashboard da Vercel.
)

REM Deploy
echo 📦 Fazendo deploy...
vercel --prod

echo ✅ Deploy concluído!
echo 🌐 Acesse: https://seu-projeto.vercel.app
echo 🔧 Configure as variáveis de ambiente no dashboard da Vercel
pause
