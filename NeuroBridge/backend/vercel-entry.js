// Vercel entrypoint for the Express backend (referenced by "entrypoint" in ../vercel.json).
// `npm run build` bundles src/main.ts together with all of its npm dependencies into
// build/server.cjs, so the deployed function does not depend on Vercel copying node_modules.
const mod = require('./build/server.cjs');
module.exports = mod.default || mod.app || mod;
