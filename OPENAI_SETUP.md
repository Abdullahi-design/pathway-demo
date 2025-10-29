# OpenAI API Setup Instructions

## Prerequisites
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Make sure you have credits in your OpenAI account

## Setup Steps

### 1. Create Environment File
Create a `.env.local` file in the root directory of the project:

```bash
# Copy this content to .env.local
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

### 2. Replace the API Key
Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Restart the Development Server
After adding the environment variables, restart the development server:

```bash
npm run dev
```

## How It Works

- **With API Key**: The app will use OpenAI's GPT models to generate realistic conversational pathways
- **Without API Key**: The app will fall back to mock data generation
- **Error Handling**: If OpenAI API fails, the app gracefully falls back to mock data

## Model Options

You can customize the OpenAI model by changing the `OPENAI_MODEL` variable:

- `gpt-4o-mini` (recommended, cost-effective)
- `gpt-4o`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

## Cost Considerations

- `gpt-4o-mini` is the most cost-effective option
- Each pathway generation typically costs $0.001-0.005
- The app includes fallback to mock data if API calls fail

## Testing

1. Start the app without an API key to test mock data
2. Add your API key and restart to test OpenAI integration
3. Try different pathway configurations to see varied results
4. Upload different file types to see how context affects generation
