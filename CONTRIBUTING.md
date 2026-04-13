# Contributing to Token Recover Self-Service Tools

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to uphold these standards.

## Reporting Bugs

Before submitting a bug report:

1. Check the [existing issues](../../issues) to avoid duplicates.
2. Gather details: Node.js version, browser, operating system, steps to reproduce.
3. Open a new issue using the **Bug Report** template.

## Suggesting Features

1. Check [existing issues](../../issues) to see if your idea has been proposed.
2. Open a new issue using the **Feature Request** template.
3. Describe the problem you are solving and why the proposed solution fits.

## Submitting Pull Requests

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/token-recover-self-service-tools.git
cd token-recover-self-service-tools
```

### 2. Install dependencies

Requires **Node.js >= 22**. We recommend using [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use   # picks up .nvmrc automatically
npm install
```

### 3. Create a branch

Use a descriptive branch name:

```bash
git checkout -b fix/address-validation
```

### 4. Make your changes

- Keep changes focused and minimal.
- Follow the existing code style (TypeScript, Tailwind CSS).
- Add or update comments where logic is non-obvious.

### 5. Verify your changes

```bash
npm run lint    # must pass
npm run build   # must succeed
npm run dev     # smoke-test the 4-step flow manually
```

### 6. Commit and push

```bash
git add <changed files>
git commit -m "fix: validate BBC address format in step 1"
git push origin fix/address-validation
```

### 7. Open a Pull Request

Open a PR against the `main` branch. Fill in the PR template and link any related issues.

## Development Tips

- All source code lives under `pages/modules/recover/`.
- The 4-step flow: `section/` contains one component per step.
- Shared utilities are in `utils/`. API calls are in `server/recover.ts`.
- The API base URL can be overridden via `NEXT_PUBLIC_APPROVAL_API` in a `.env.local` file (see `.env.example`).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
