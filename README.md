# 🤖 Advanced AI-Powered Chatbot Application

A cutting-edge, full-stack chatbot application featuring multiple AI providers, RAG (Retrieval-Augmented Generation), campaign management, and a futuristic UI built with modern technologies.

## ✨ Features

### 🎨 **Futuristic UI/UX**
- Dark theme with neon accents and gradient effects
- Smooth animations using Framer Motion
- Responsive design for desktop and mobile
- Particle effects and holographic elements
- Real-time chat with typing indicators

### 🧠 **Multiple AI Providers**
- **OpenAI** (GPT-4, GPT-3.5-turbo)
- **Groq** (Llama models, Mixtral)
- **Mistral AI** (Large, Medium, Small)
- **DeepSeek** (Chat, Coder)
- **Hugging Face** (Open-source models)
- **xAI Grok** (When available)

### 📚 **RAG (Retrieval-Augmented Generation)**
- Upload PDF, DOC, DOCX, and TXT files
- Intelligent document chunking and processing
- Vector embeddings for semantic search
- Context-aware AI responses
- Document management and indexing

### 🎯 **Campaign Management**
- Pre-built campaign templates
- Custom prompt creation and editing
- Campaign-specific settings and configurations
- Usage analytics and performance tracking

### 🔐 **Security & Authentication**
- JWT-based authentication
- Secure API key management
- Input validation and sanitization
- Rate limiting and security headers

## 🚀 Tech Stack

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **LangChain** for AI integrations

### **Frontend**
- **React 18** with Hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls

### **AI & ML**
- **OpenAI API** integration
- **Sentence Transformers** for embeddings
- **FAISS** for vector similarity search
- **PDF.js** and **Mammoth** for document processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-chatbot-app
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-chatbot

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# AI Provider API Keys
OPENAI_API_KEY=your-openai-api-key-here
GROQ_API_KEY=your-groq-api-key-here
MISTRAL_API_KEY=your-mistral-api-key-here
DEEPSEEK_API_KEY=your-deepseek-api-key-here
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 5. Start the Application
```bash
# Development mode (both frontend and backend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🏗️ Project Structure

```
ai-chatbot-app/
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── index.js          # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   └── App.js        # Main app component
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 Configuration

### Campaign Templates
The application comes with pre-built campaign templates:

1. **Customer Support**: Helpful support agent responses
2. **Outbound Sales**: Proactive sales outreach
3. **Lead Generation**: Lead qualification and nurturing
4. **Technical Support**: Technical problem solving
5. **General Assistant**: Multi-purpose AI helper

### File Upload Limits
- **Maximum file size**: 10MB
- **Supported formats**: PDF, DOC, DOCX, TXT
- **Processing**: Automatic text extraction and chunking

### Rate Limiting
- **Window**: 15 minutes
- **Maximum requests**: 100 per window
- **Configurable** via environment variables

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the build folder
```

### Backend (Heroku/AWS)
```bash
# Set environment variables
# Deploy to your preferred platform
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
# Add all required API keys
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm test -- --testPathPattern=auth
```

## 📱 Usage

### 1. **Authentication**
- Sign up with email and password
- Login to access the dashboard
- JWT tokens are automatically managed

### 2. **Campaign Selection**
- Choose from pre-built campaigns
- Create custom campaigns with specific prompts
- Switch between campaigns during chat

### 3. **AI Model Selection**
- Select your preferred AI provider
- Configure model parameters (temperature, tokens)
- Monitor usage and costs

### 4. **Document Upload (RAG)**
- Upload knowledge base documents
- Automatic processing and indexing
- AI responses include relevant document context

### 5. **Chat Interface**
- Real-time messaging
- Voice input/output support
- Emoji reactions
- File attachments

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **JWT Security**: Secure token-based authentication
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers and protection
- **File Upload Security**: Type and size validation

## 🚧 Development

### Adding New AI Providers
1. Add provider configuration to `server/services/llmService.js`
2. Update environment variables
3. Add provider selection to frontend
4. Test integration

### Custom Campaigns
1. Create campaign in database
2. Define custom prompts and settings
3. Configure RAG settings if needed
4. Test with sample conversations

### Styling Customization
- Modify `client/tailwind.config.js` for theme changes
- Update component styles in respective files
- Add new animations in Tailwind config

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

## 🔮 Future Enhancements

- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Advanced Analytics**: Detailed usage and performance metrics
- [ ] **Team Collaboration**: Multi-user campaigns and sharing
- [ ] **API Integration**: Webhook support and third-party integrations
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced RAG**: Multi-modal document support (images, audio)
- [ ] **Custom Models**: Fine-tuned model training and deployment

## 🙏 Acknowledgments

- **OpenAI** for GPT models and API
- **Groq** for fast inference models
- **Mistral AI** for open-weight models
- **React Team** for the amazing framework
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations

---

**Built with ❤️ by the AI Development Team**

*This application demonstrates modern full-stack development practices and showcases the power of AI integration in web applications.*
