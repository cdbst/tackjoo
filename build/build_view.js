require('esbuild')
  .build({
    entryPoints: ['src/view/index.jsx'],
    outdir: 'dist',
    bundle: true
  })
  .catch(() => process.exit(1))