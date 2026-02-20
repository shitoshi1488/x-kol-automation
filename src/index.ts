import { XKOLAutomation } from './app';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    const automation = new XKOLAutomation();
    await automation.initialize();

    automation.getApp().listen(PORT, () => {
      console.log(`X KOL Automation System running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Status: http://localhost:${PORT}/status`);
    });

    automation.start();

    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await automation.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down...');
      await automation.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start system:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { XKOLAutomation };