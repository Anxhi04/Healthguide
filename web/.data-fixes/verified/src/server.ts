// Import firebase config FIRST to ensure Firebase is initialized before app uses it
import "./config/firebase";

import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});