# KTU Bot

Welcome to the KTU Bot! This Telegram bot helps students check their exam results, find latest KTU notifications and alert users when new notifications arrive.

Find the bot [here](https://t.me/ktu_results_bot)

## Features

- **Check Results**: Use the `/result` command to fetch your exam results.
- **Download latest KTU notifications**: Use the `/notifications` command to fetch KTU notifications and download them.
- **Subscribe to latest KTU notifications**: Use the `/subscribe` command to recieve new notifications as they arrive.
- **Help**: Get help using the `/help` command.

## Getting Started

### Running Locally (Without Docker)

1. Install Node.js and npm on your machine.
2. Clone the repository:

   ```bash
   git clone https://github.com/devadathanmb/ktu-bot.git
   ```

3. Navigate to the project directory:

   ```bash
   cd ktu-bot
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Set up your Telegram bot token:

   - Create a new bot on Telegram using the [BotFather](https://core.telegram.org/bots#botfather).
   - Copy the bot token.
   - Create a `.env` file in the project root and add:

     ```env
     BOT_TOKEN="your-telegram-bot-token"
     ```

     See [env.example]("./env.example") file for example

<<<<<<< Updated upstream
6. Create a Firebase project and setup a Firestore database in [Firebase console](https://console.firebase.google.com/u/0/)

7. Download the `serviceAccountKey.json` file and put it in the root directory
=======
| Component                       | Type                | What It Does                                                                                  |
| ------------------------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| **Bot**                         | GrammY Telegram bot | Handles all user interactions: commands, searches, conversations                              |
| **Announcements Notify Worker** | Background worker   | Monitors for new announcements using BullMQ scheduled jobs and sends filtered alerts to users |
| **Broadcasts Worker**           | Background worker   | Handles queued broadcast message delivery                                                     |
| **Data Sync Worker**            | Background worker   | Periodically syncs KTU data to local DB via BullMQ scheduled jobs to power full-text search   |
| **Attachment Delivery Worker**  | Background worker   | Downloads and sends files asynchronously to prevent bot blocking                              |
| **Web Platform REST API**       | REST API Service    | Serves Admin Dashboard, KTU ingestion, and Poster Studio endpoints (`src/web-api/`)          |
| **Poster Generation Worker**    | Background worker   | BullMQ worker for automated and on-demand social poster rendering (`src/workers/poster-gen/`)  |
| **Poster Studio Web App**       | React 19 Frontend   | Modern SaaS dashboard, canvas/DOM live editor, and 11-template design studio (`web-app/`)    |
| **Bull Board Service**          | Monitoring service  | Web dashboard for real-time queue monitoring and job management                               |
| **PostgreSQL**                  | Database            | Stores all data with Drizzle ORM for type-safe queries                                        |
| **Redis**                       | Queue               | Powers BullMQ jobs                                                                            |

## KTU B.Tech Web Platform & Automated Poster Studio

Alongside the Telegram bot, the platform provides a modern SaaS web interface for B.Tech announcement management and automated social poster generation:

- **Admin Dashboard**: Live KTU portal ingestion, 14-category classification, and full-text search.
- **Automated Poster Studio**: Live canvas/DOM editor supporting 11 university-grade templates, 4 aspect ratios (`1080x1350`, `1080x1920`, `1080x1080`, `1200x628`), bilingual typography (English + Malayalam), and high-resolution export (PNG/JPEG/SVG).
- **Background Automation**: Configurable fetch scheduler supporting Mode A (Manual Approval) and Mode B (Fully Automatic Generation).

### Running the Web Platform Locally

```bash
# 1. Start Web REST API (Port 4000)
pnpm dev:web-api

# 2. Start Poster Generation Worker (Port 4005)
pnpm workers:poster-generation-worker-dev

# 3. Start React SaaS Frontend (Port 5173)
cd web-app && pnpm dev
```

## Quick Start
>>>>>>> Stashed changes

8. Build the bot:

   ```bash
   npm run build
   ```

9. Start the bot:

   ```bash
   npm run start
   ```

### Running with Docker Compose

1. Install Docker and Docker Compose on your machine.

2. Clone the repository:

   ```bash
   git clone https://github.com/devadathanmb/ktu-bot.git
   ```

3. Navigate to the project directory:

   ```bash
   cd ktu-bot
   ```

4. Create a `.env` file in the project root and add:

   ```env
   BOT_TOKEN="your-telegram-bot-token"
   ```

5. Run the application using Docker Compose:

   ```bash
   docker-compose up
   ```

The bot should now be running and accessible on Telegram.

## Commands

- `/start`: Start the bot and get a welcome message.
- `/help`: Show a help message with available commands.
- `/result`: Fetch your exam results.
- `/notifications`: Find and download latest KTU notifications.
- `/subscribe`: Subscribe to recieve latest KTU notifications as they arrive.
- `/unsubscribe`: Unsubscribe from recieving KTU notifications.
- `/cancel`: Cancel current process (only works when inside `/notifications` or `/result` wizard)

## Contributing

If you encounter any issues, have feature suggestions, or want to contribute to the project, please feel free to fork and make a PR.

## Bugs and Feedback

If you find any bugs or have feedback, please [open an issue](https://github.com/devadathanmb/ktu-results-bot/issues) on GitHub.

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE.md](./LICENSE.md) file for details.
