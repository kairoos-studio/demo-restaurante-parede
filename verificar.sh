#!/usr/bin/env bash
# Verificação completa: instala, faz build, lint e testes. Falha se algo falhar.
set -euo pipefail
cd "$(dirname "$0")"

export ASTRO_TELEMETRY_DISABLED=1
export CI=1

echo "==> Dependências (npm ci)"
npm ci --no-audit --no-fund

echo "==> Build"
npm run build

echo "==> Lint (ESLint + astro check)"
npm run lint

echo "==> Testes"
npm test

echo "==> Ficheiros versionados intactos"
if [ -d .git ] && ! git diff --quiet -- . ; then
  git status --short
  echo "ERRO: a verificação alterou ficheiros versionados." >&2
  exit 1
fi

echo "OK: tudo verificado."
