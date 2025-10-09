// .pnpmfile.cjs

function readPackage(pkg, context) {
  // The version you want to force. Check your package.json or pnpm-lock.yaml
  // for a version that works with your ESLint version.
  const desiredReactHooksVersion = "5.0.0"; // Example version, adjust as needed

  if (pkg.dependencies?.["eslint-plugin-react-hooks"]) {
    pkg.dependencies["eslint-plugin-react-hooks"] = desiredReactHooksVersion;
  }
  if (pkg.devDependencies?.["eslint-plugin-react-hooks"]) {
    pkg.devDependencies["eslint-plugin-react-hooks"] = desiredReactHooksVersion;
  }
  if (pkg.peerDependencies?.["eslint-plugin-react-hooks"]) {
    pkg.peerDependencies["eslint-plugin-react-hooks"] =
      desiredReactHooksVersion;
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
