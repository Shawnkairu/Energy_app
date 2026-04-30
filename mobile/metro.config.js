const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(repoRoot, "packages/shared"),
  path.resolve(repoRoot, "packages/ui"),
  path.resolve(repoRoot, "packages/api-client"),
];

config.resolver.nodeModulesPaths = [
  path.resolve(repoRoot, "node_modules"),
  path.resolve(projectRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
