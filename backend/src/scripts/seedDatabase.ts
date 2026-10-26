// Legacy entry point delegates to the inspected, backed-up demo workflow.
import { main } from './manageHealthGuideDemo';
main(process.argv[2] ?? 'seed').then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});
