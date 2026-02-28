## 📝 Summary
This PR migrates the project from Webpack to Vite for faster builds and better development experience.

## 🔧 Changes
- **New file**: `vite.config.ts` - Vite configuration with library mode (UMD + ES modules)
- **Updated**: `package.json` - Replaced Webpack deps with Vite, updated npm scripts
- **Updated**: `tsconfig.json` - Modern TypeScript configuration for Vite
- **New file**: `tsconfig.node.json` - TypeScript config for Vite config file

## ✨ Key Benefits
- ⚡ Faster dev server startup (HMR support)
- 📦 Optimized production builds with Terser
- 🎯 Better TypeScript support
- 🔄 Maintains backward compatibility (UMD output)
- 🚀 Cleaner npm scripts

## 📋 Breaking Changes
None - The package maintains the same export structure and API.

## 🧪 Testing
- Verify `npm run dev` starts the dev server correctly
- Verify `npm run build` generates both UMD and ES modules
- Test the built library in both Node.js and browser environments