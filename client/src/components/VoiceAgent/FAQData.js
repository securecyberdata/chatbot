// Sample FAQ data for Voice Agent
export const faqData = [
  {
    category: "General Questions",
    questions: [
      {
        question: "What is artificial intelligence?",
        answer: "Artificial Intelligence (AI) is a branch of computer science that aims to create systems capable of performing tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding."
      },
      {
        question: "How does machine learning work?",
        answer: "Machine learning is a subset of AI where computers learn patterns from data without being explicitly programmed. They use algorithms to identify relationships in data and make predictions or decisions based on what they've learned."
      },
      {
        question: "What are the different types of AI?",
        answer: "There are three main types of AI: Narrow AI (designed for specific tasks), General AI (human-like intelligence), and Superintelligent AI (surpassing human intelligence). Currently, we mainly use Narrow AI in applications like voice assistants and recommendation systems."
      }
    ]
  },
  {
    category: "Technology",
    questions: [
      {
        question: "What is the difference between AI and automation?",
        answer: "Automation follows predefined rules to perform repetitive tasks, while AI can learn, adapt, and make decisions. AI can handle complex, non-linear problems, while automation is best for predictable, rule-based processes."
      },
      {
        question: "How does natural language processing work?",
        answer: "Natural Language Processing (NLP) combines computational linguistics, machine learning, and deep learning to help computers understand, interpret, and generate human language. It processes text and speech to extract meaning and context."
      },
      {
        question: "What is deep learning?",
        answer: "Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers to model and understand complex patterns. It's particularly effective for tasks like image recognition, speech processing, and natural language understanding."
      }
    ]
  },
  {
    category: "Business Applications",
    questions: [
      {
        question: "How can AI benefit my business?",
        answer: "AI can benefit businesses by automating repetitive tasks, improving customer service through chatbots, analyzing data for insights, optimizing operations, and creating personalized experiences. It can increase efficiency, reduce costs, and drive innovation."
      },
      {
        question: "What are the risks of implementing AI?",
        answer: "AI implementation risks include data privacy concerns, bias in algorithms, job displacement, high implementation costs, and the need for ongoing maintenance. It's important to have proper governance, testing, and human oversight."
      },
      {
        question: "How do I get started with AI in my business?",
        answer: "Start by identifying specific problems AI can solve, assess your data quality, choose appropriate AI tools, start with pilot projects, and ensure you have the right team and infrastructure. Begin small and scale gradually."
      }
    ]
  },
  {
    category: "Voice Technology",
    questions: [
      {
        question: "How does speech recognition work?",
        answer: "Speech recognition converts spoken words into text using acoustic models, language models, and pronunciation dictionaries. Modern systems use deep learning to understand context, accents, and variations in speech patterns."
      },
      {
        question: "What is text-to-speech technology?",
        answer: "Text-to-speech (TTS) converts written text into spoken audio. Modern TTS uses neural networks to produce natural-sounding speech with proper intonation, rhythm, and emotion, making it sound more human-like."
      },
      {
        question: "How accurate is voice recognition?",
        answer: "Modern voice recognition systems can achieve 95%+ accuracy in ideal conditions. Accuracy depends on factors like background noise, speaker accent, microphone quality, and the specific technology used (e.g., AssemblyAI, Deepgram, or Google Speech)."
      }
    ]
  },
  {
    category: "Future of AI",
    questions: [
      {
        question: "Will AI replace human workers?",
        answer: "AI will likely augment rather than replace human workers. While some jobs may be automated, new roles will emerge that require human creativity, emotional intelligence, and AI collaboration. The focus should be on human-AI partnership."
      },
      {
        question: "What are the ethical considerations of AI?",
        answer: "Key ethical considerations include ensuring AI systems are fair and unbiased, protecting privacy and data security, maintaining transparency in decision-making, and ensuring AI benefits society while minimizing potential harms."
      },
      {
        question: "How will AI change our daily lives?",
        answer: "AI will become more integrated into daily life through smart homes, autonomous vehicles, personalized healthcare, intelligent assistants, and enhanced entertainment. It will make many tasks more convenient and efficient while creating new possibilities."
      }
    ]
  }
];

// Sample conversation starters for Voice Agent
export const conversationStarters = [
  "Tell me about artificial intelligence",
  "How does machine learning work?",
  "What are the benefits of AI in business?",
  "Explain natural language processing",
  "What is the future of AI?",
  "How accurate is voice recognition?",
  "What are the risks of AI?",
  "How can I get started with AI?",
  "What is deep learning?",
  "How does speech recognition work?"
];

// Voice Agent personality and responses
export const voiceAgentPersonality = {
  greeting: "Hello! I'm your AI voice assistant. I can help you with questions about artificial intelligence, technology, business applications, and more. What would you like to know?",
  
  thinking: [
    "Let me think about that...",
    "That's an interesting question...",
    "Let me process that for you...",
    "I'm analyzing your question..."
  ],
  
  clarification: [
    "Could you please rephrase that?",
    "I didn't quite catch that. Could you repeat?",
    "Can you be more specific?",
    "I'm not sure I understood. Could you clarify?"
  ],
  
  followUp: [
    "Is there anything else you'd like to know about that?",
    "Would you like me to explain this in more detail?",
    "Do you have any other questions?",
    "Is there a specific aspect you'd like me to focus on?"
  ],
  
  goodbye: [
    "Thank you for chatting with me! Feel free to ask more questions anytime.",
    "It was great helping you today. Have a wonderful day!",
    "I'm here whenever you need assistance. Take care!",
    "Thanks for the conversation. Don't hesitate to reach out again!"
  ]
};

// Voice Agent capabilities
export const voiceAgentCapabilities = [
  "Answer questions about AI and technology",
  "Provide business insights and advice",
  "Explain complex concepts in simple terms",
  "Help with problem-solving and decision making",
  "Offer personalized recommendations",
  "Engage in natural conversations",
  "Learn from our interactions",
  "Provide real-time information and updates"
];
