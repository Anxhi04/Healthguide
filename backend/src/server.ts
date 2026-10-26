// Import firebase config FIRST to ensure Firebase is initialized before app uses it
import { verifyFirebaseConnection } from "./config/firebase";

import app from "./app";

const PORT = process.env.PORT || 5000;

verifyFirebaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(() => {
  // The detailed Firebase error is logged above; do not advertise a broken API.
  process.exitCode = 1;
});
