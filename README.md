# TalentGrid: Professional Networking & Team Builder

[cloudflarebutton]

A minimalist, single-page application for tech professionals to create profiles, discover collaborators, and build teams, set against a stunning animated background.

TalentGrid is a visually stunning, minimalist single-page application designed to make professional networks visible. It serves as a centralized hub for tech professionals to create detailed profiles, showcase their skills with proficiency levels, and discover potential collaborators. The application features an elegant, intuitive tab-based interface for seamless navigation between its core functionalities.

## ✨ Key Features

*   **Profile Creation**: Build a detailed professional profile, including skills with proficiency levels, a short bio, and availability status.
*   **Individual Search**: Find professionals by name or specific skills to discover potential collaborators.
*   **Intelligent Team Builder**: Specify required skills and a desired team size to get AI-powered recommendations for the optimal team composition.
*   **Leaderboards**: View top community members based on skills and other metrics to foster engagement.
*   **Stunning UI**: A clean, minimalist interface with a captivating animated neural network background.
*   **Responsive Design**: Flawless experience across all device sizes, from mobile to desktop.

## 🛠️ Technology Stack

*   **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
*   **Backend**: [Cloudflare Workers](https://workers.cloudflare.com/), [Hono](https://hono.dev/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
*   **Database**: [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Deployment**: [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Bun](https://bun.sh/) installed on your machine.
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated: `bunx wrangler login`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/talent-grid.git
    cd talent-grid
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Hono backend on Cloudflare Workers, run:

```bash
bun run dev
```

This will start the development server, typically on `http://localhost:3000`. The frontend will automatically reload on changes, and the worker backend will be available for API requests.

### Project Structure

*   `src/`: Contains the React frontend application code.
    *   `pages/`: Main application views.
    *   `components/`: Reusable UI components.
    *   `lib/`: Utility functions and API client.
*   `worker/`: Contains the Cloudflare Worker backend code (Hono).
    *   `index.ts`: The entry point for the worker.
    *   `user-routes.ts`: API route definitions.
    *   `entities.ts`: Durable Object entity definitions.
*   `shared/`: TypeScript types shared between the frontend and backend.

## 📜 Available Scripts

*   `bun run dev`: Starts the local development server.
*   `bun run build`: Builds the frontend application for production.
*   `bun run deploy`: Deploys the application to Cloudflare Workers.
*   `bun run lint`: Lints the codebase using ESLint.

## ☁️ Deployment

This project is designed for seamless deployment to the Cloudflare ecosystem.

To deploy your application, simply run the following command:

```bash
bun run deploy
```

This command will build the React application and deploy it along with the Hono worker to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]

## 🏗️ Architecture

TalentGrid is built on a modern, serverless architecture:

*   **Frontend**: A Single Page Application (SPA) built with React and Vite. It handles all UI rendering and user interactions.
*   **Backend**: A serverless API built with Hono, running on Cloudflare Workers. It processes requests, handles business logic, and communicates with the storage layer.
*   **Storage**: State is persisted using a single Cloudflare Durable Object class, which provides a scalable and consistent storage layer on the edge.
*   **Type Safety**: Shared TypeScript types between the frontend and backend ensure data consistency and reduce runtime errors.