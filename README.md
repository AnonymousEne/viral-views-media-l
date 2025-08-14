# 🎥 Viral Views

**Media Social Streaming Platform for Video Sharing, Editing, Rap Battles, Cyphers, and Creator Battles**

A cutting-edge platform that combines social media, video streaming, and AI-powered content creation tools for rap battles, cyphers, and creator competitions.

## 🚀 Features

- **Video Streaming & Sharing** - Real-time video streaming with social features
- **Rap Battle Platform** - Organized battles and cyphers with voting systems  
- **AI-Powered Content Creation** - Google AI/Vertex AI integration for content enhancement
- **Creator Tools** - Video editing, effects, and monetization features
- **Social Features** - Follow creators, comment, react, and share content
- **Live Events** - Real-time battles and community events

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Google GenKit, Firebase
- **AI/ML**: Google Vertex AI, Google GenAI, TensorFlow
- **Database**: Firestore, PostgreSQL
- **Infrastructure**: Google Cloud Platform, Kubernetes
- **Video Processing**: FFmpeg, Google Cloud Video API

## 📋 Prerequisites

Before setting up the project, make sure you have:

- Node.js 18+ installed
- Python 3.8+ installed
- Google Cloud account with billing enabled
- Firebase project set up
- Docker (optional, for containerized development)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Viral-Views

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# - Google Cloud Project ID
# - Firebase configuration
# - API keys
```

### 3. Google Cloud Setup

1. Create a Google Cloud project
2. Enable APIs:
   - Vertex AI API
   - Firestore API
   - Cloud Storage API
   - Video Intelligence API
3. Create a service account and download the key
4. Set `GOOGLE_APPLICATION_CREDENTIALS` in your `.env`

### 4. Firebase Setup

1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Get your Firebase config and add to `.env`

### 5. Run the Development Server

```bash
# Start the Next.js development server
npm run dev

# Or start with GenKit for AI features
npm run genkit:dev
```

Visit [http://localhost:9002](http://localhost:9002) to see the application.

## 🐳 Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

## 📊 ML Model Development

The project includes Jupyter notebooks for AI/ML development:

```bash
# Start Jupyter Lab
jupyter lab

# Navigate to notebooks/model-predictions.ipynb
```

## 🚀 Deployment

### Google Cloud Platform

```bash
# Build for production
npm run build

# Deploy to Google Cloud Run
gcloud run deploy viral-views --source .
```

### Kubernetes

```bash
# Apply Kubernetes configurations
kubectl apply -f docker
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## 🔗 Links

- [Documentation](docs/)
- [API Reference](docs/api.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Discord Community](https://discord.gg/viral-views)