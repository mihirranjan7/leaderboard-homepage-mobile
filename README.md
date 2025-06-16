This component displays a Top Contributors Leaderboard on the homepage of a Discourse forum. It fetches and renders the top users based on weekly likes received, and gives users the ability to temporarily dismiss the leaderboard.

⚙️ Features

🔄 Auto-fetches top 20 users from the /directory_items.json endpoint.
🕐 Dismisses the leaderboard for 24 hours using localStorage.
🏠 Homepage-aware: The component renders only on the default homepage route.
✋ Excludes staged and anonymized users from the leaderboard.
📦 Lightweight and does not rely on additional Ember addons.
