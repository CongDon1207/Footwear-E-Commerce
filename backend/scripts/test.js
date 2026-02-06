process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-auth';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';

const { authAdminCases } = require('./auth-admin-cases');
const { orderCases } = require('./order-cases');

const backendCases = [...authAdminCases, ...orderCases];

const runCase = async (name, testFn) => {
  try {
    await testFn();
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    return false;
  }
};

const main = async () => {
  let failed = 0;

  for (const item of backendCases) {
    const ok = await runCase(item.name, item.testFn);
    if (!ok) {
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} backend test case(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${backendCases.length} backend test case(s) passed.`);
};

main();
