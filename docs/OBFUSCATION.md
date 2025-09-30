# Code Obfuscation Documentation

## Overview

This project uses `nextjs-obfuscator` with `javascript-obfuscator` to protect the client-side code from reverse engineering and unauthorized access.

## Installation

The following packages have been installed:
```bash
pnpm add -D javascript-obfuscator nextjs-obfuscator
```

## Configuration

The obfuscation is configured in `next.config.ts` with the following security features:

### Obfuscation Features

1. **Control Flow Flattening** (75% threshold)
   - Makes the code flow harder to understand
   - Transforms code structure to be non-linear

2. **Dead Code Injection** (40% threshold)
   - Adds fake code blocks that are never executed
   - Confuses reverse engineering attempts

3. **String Array Encoding**
   - Encodes strings using base64
   - Makes string literals unreadable

4. **Debug Protection** (Production only)
   - Prevents debugging tools from working properly
   - Blocks debugger statements

5. **Self Defending** (Production only)
   - Code protects itself from tampering
   - Detects and prevents modifications

6. **Variable Renaming**
   - Renames variables to hexadecimal names
   - Makes code harder to understand

7. **String Splitting**
   - Splits strings into chunks
   - Reassembles at runtime

8. **Object Keys Transformation**
   - Transforms object property names
   - Makes object structure unclear

## Usage

### Enable Obfuscation (Production)
```bash
pnpm build
```

### Disable Obfuscation (Development/Debugging)
```bash
DISABLE_OBFUSCATION=true pnpm build
```

## Protected Files

The following patterns are obfuscated:
- All JavaScript files (`**/*.js`)
- All JSX files (`**/*.jsx`)
- All TypeScript files (`**/*.ts`)
- All TSX files (`**/*.tsx`)

Additional protection for:
- Build manifests
- SSG manifests
- Webpack bundles
- Library files (`lib/**/*`)
- Utility files (`utils/**/*`)
- Context files (`contexts/**/*`)
- Hook files (`hooks/**/*`)

## Security Levels

### Development Mode
- Obfuscation: Detect mode (minimal)
- Console output: Enabled
- Debug protection: Disabled
- Self-defending: Disabled

### Production Mode
- Obfuscation: Full
- Console output: Preserved for React errors
- Debug protection: Enabled
- Self-defending: Enabled

## Performance Considerations

Obfuscation adds overhead:
- **Build time**: ~20-30% increase
- **Bundle size**: ~30-40% increase
- **Runtime performance**: ~5-10% decrease

## Troubleshooting

### Build Errors
If the build fails with obfuscation:
1. Check for syntax errors
2. Try building without obfuscation: `DISABLE_OBFUSCATION=true pnpm build`
3. Review error logs for specific module issues

### Runtime Errors
If the app breaks after obfuscation:
1. Check browser console for React errors
2. Verify all dynamic imports are working
3. Test with `disableConsoleOutput: false` to see errors

### Debugging Obfuscated Code
For debugging production issues:
1. Build with source maps: Set `sourceMap: true` in obfuscatorOptions
2. Use development build: `pnpm dev`
3. Temporarily disable: `DISABLE_OBFUSCATION=true`

## Best Practices

1. **Test Thoroughly**: Always test obfuscated builds before deployment
2. **Keep Backups**: Maintain unobfuscated builds for debugging
3. **Monitor Performance**: Check app performance after obfuscation
4. **Update Regularly**: Keep obfuscator packages updated
5. **Custom Exclusions**: Add sensitive paths to patterns if needed

## Security Notes

⚠️ **Important**: 
- Obfuscation is NOT encryption
- Determined attackers can still reverse engineer
- Use alongside other security measures:
  - Server-side validation
  - API authentication
  - Rate limiting
  - HTTPS only
  - CSP headers

## Additional Resources

- [nextjs-obfuscator](https://github.com/mtripg6666tdr/nextjs-obfuscator)
- [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)
- [Obfuscator Options](https://github.com/javascript-obfuscator/javascript-obfuscator#options)