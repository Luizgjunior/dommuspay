# 💰 DommusPay - Sistema de Controle Financeiro

![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue.svg)
![Vercel](https://img.shields.io/badge/deployed-vercel-black.svg)

Sistema web completo para controle de receitas e despesas pessoais, desenvolvido com **Node.js**, **PostgreSQL** e **JavaScript**. Interface moderna com tema escuro, funcionalidades avançadas de análise financeira e **API REST** robusta.

## 🚀 Demo

**🌐 Acesse:** [dommuspay.vercel.app](https://dommuspay.vercel.app) *(em breve)*

**👤 Login Demo:**
- **Email:** demo@financeiro.com
- **Senha:** (automático)

## ✨ Funcionalidades

### 📊 Dashboard Inteligente
- Resumo financeiro em tempo real
- Gráficos interativos (Chart.js)
- Transações recentes
- KPIs personalizados

### 💳 Gestão de Transações
- Adicionar receitas e despesas
- Categorias personalizáveis
- Filtros avançados
- Busca inteligente
- Ações em lote

### 📈 Análises Avançadas
- Relatórios por período
- Comparativos por categoria
- Tendências mensais
- Exportação de dados

### ⚙️ Configurações
- Perfil personalizado
- Temas claro/escuro
- Categorias customizadas
- Limites de gastos
- Backup de dados

## 🛠️ Tecnologias

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Design moderno com glassmorphism
- **JavaScript ES6+** - Lógica de negócio
- **Chart.js** - Gráficos interativos
- **FontAwesome** - Ícones vetoriais

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados (NeonDB)
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas
- **Joi** - Validação de dados

### Deploy
- **Vercel** - Hospedagem serverless
- **NeonDB** - Banco PostgreSQL na nuvem
- **GitHub** - Controle de versão

## 🚀 Instalação Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL ou NeonDB
- Git

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/Luizgjunior/dommuspay.git
cd dommuspay
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp backend/config.env.example backend/.env

# Edite com suas credenciais
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=sua-chave-secreta
NODE_ENV=development
```

4. **Inicialize o banco de dados**
```bash
npm run init-db
```

5. **Execute a aplicação**
```bash
npm start
```

6. **Acesse**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## 🌐 Deploy na Vercel

### 1. Fork do repositório
- Faça fork deste repositório
- Clone seu fork localmente

### 2. Configure o NeonDB
- Crie conta em [neon.tech](https://neon.tech)
- Crie um novo projeto
- Copie a DATABASE_URL

### 3. Deploy na Vercel
- Conecte seu repositório na [Vercel](https://vercel.com)
- Configure as variáveis de ambiente:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NODE_ENV=production`

### 4. Inicialize o banco
```bash
node backend/database/init.js
```

## 📱 Responsividade

- ✅ **Mobile-first** design
- ✅ **Touch-friendly** interface
- ✅ **Gestos intuitivos** para mobile
- ✅ **Navegação por teclado**
- ✅ **Temas** claro/escuro

## 🔒 Segurança

- ✅ **Autenticação JWT** segura
- ✅ **Hash de senhas** com bcryptjs
- ✅ **Validação de dados** com Joi
- ✅ **Rate limiting** implementado
- ✅ **CORS** configurado
- ✅ **Headers de segurança** com Helmet

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/demo` - Login demo
- `GET /api/auth/verify` - Verificar token

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Excluir transação

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Excluir categoria

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Luiz Junior**
- GitHub: [@Luizgjunior](https://github.com/Luizgjunior)
- LinkedIn: [luiz-junior](https://linkedin.com/in/luiz-junior)

## 🙏 Agradecimentos

- [Chart.js](https://chartjs.org) - Gráficos interativos
- [FontAwesome](https://fontawesome.com) - Ícones
- [Vercel](https://vercel.com) - Hospedagem
- [NeonDB](https://neon.tech) - Banco de dados
- [Express](https://expressjs.com) - Framework web

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐