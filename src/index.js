import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, getAllConfig, isConfigured } from './config.js';
import {
  createSession,
  getSession,
  deleteSession,
  listSessions,
  registerKey,
  getKey,
  revokeKey,
  updateKey,
  listScopes,
  getScope,
  requestScope
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Authentiq token not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  authentiq config set token YOUR_BEARER_TOKEN'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('authentiq')
  .description(chalk.bold('Authentiq CLI') + ' - Identity and session management from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('get <key>')
  .description('Get a configuration value')
  .action((key) => {
    const value = getConfig(key);
    if (value === undefined) {
      printError(`Key '${key}' not found`);
    } else {
      console.log(value);
    }
  });

configCmd
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key, value) => {
    setConfig(key, value);
    printSuccess(`Config '${key}' set`);
  });

configCmd
  .command('list')
  .description('List all configuration values')
  .action(() => {
    const all = getAllConfig();
    console.log(chalk.bold('\nAuthentiq CLI Configuration\n'));
    if (Object.keys(all).length === 0) {
      console.log(chalk.yellow('No configuration set.'));
      console.log('\nRun: ' + chalk.cyan('authentiq config set token YOUR_TOKEN'));
    } else {
      Object.entries(all).forEach(([k, v]) => {
        const displayVal = k === 'token' ? chalk.green('*'.repeat(Math.min(String(v).length, 8))) : chalk.cyan(String(v));
        console.log(`${k}: ${displayVal}`);
      });
    }
  });

// ============================================================
// SESSIONS
// ============================================================

const sessionsCmd = program.command('sessions').description('Manage identity sessions');

sessionsCmd
  .command('list')
  .description('List active sessions')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const sessions = await withSpinner('Fetching sessions...', () => listSessions());

      if (options.json) {
        printJson(sessions);
        return;
      }

      const data = Array.isArray(sessions) ? sessions : (sessions ? [sessions] : []);
      printTable(data, [
        { key: 'session', label: 'Session ID', format: (v) => v ? String(v).substring(0, 16) + '...' : 'N/A' },
        { key: 'status', label: 'Status' },
        { key: 'created', label: 'Created' },
        { key: 'scope', label: 'Scope', format: (v) => Array.isArray(v) ? v.join(' ') : (v || '') }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

sessionsCmd
  .command('create')
  .description('Create a new session')
  .option('--scope <scope>', 'Requested scope (space-separated)', 'openid')
  .option('--callback <url>', 'Callback URL')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const sessionData = {
        scope: options.scope.split(' '),
        ...(options.callback && { callback: options.callback })
      };

      const session = await withSpinner('Creating session...', () => createSession(sessionData));

      if (options.json) {
        printJson(session);
        return;
      }

      printSuccess('Session created');
      if (session) {
        console.log('Session:   ', chalk.cyan(session.session || JSON.stringify(session)));
        if (session.status) console.log('Status:    ', session.status);
        if (session.url) console.log('Auth URL:  ', chalk.blue(session.url));
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

sessionsCmd
  .command('get <session-id>')
  .description('Get session details')
  .option('--json', 'Output as JSON')
  .action(async (sessionId, options) => {
    requireAuth();
    try {
      const session = await withSpinner(`Fetching session ${sessionId}...`, () =>
        getSession(sessionId)
      );

      if (!session) {
        printError('Session not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(session);
        return;
      }

      console.log(chalk.bold('\nSession Details\n'));
      console.log('Session ID:  ', chalk.cyan(session.session || sessionId));
      console.log('Status:      ', session.status || 'N/A');
      console.log('Created:     ', session.created || 'N/A');
      if (session.scope) console.log('Scope:       ', Array.isArray(session.scope) ? session.scope.join(' ') : session.scope);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

sessionsCmd
  .command('delete <session-id>')
  .description('Delete (revoke) a session')
  .action(async (sessionId) => {
    requireAuth();
    try {
      await withSpinner(`Deleting session ${sessionId}...`, () => deleteSession(sessionId));
      printSuccess(`Session ${sessionId} deleted`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// KEYS
// ============================================================

const keysCmd = program.command('keys').description('Manage identity keys');

keysCmd
  .command('register')
  .description('Register a new public key')
  .requiredOption('--key <json>', 'Public key data as JSON (JWK format)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let keyData;
    try {
      keyData = JSON.parse(options.key);
    } catch {
      printError('Invalid JSON for --key');
      process.exit(1);
    }

    try {
      const result = await withSpinner('Registering key...', () => registerKey(keyData));

      if (options.json) {
        printJson(result);
        return;
      }

      printSuccess('Key registered');
      if (result) {
        console.log('Key ID:  ', chalk.cyan(result.pk || result.kid || JSON.stringify(result)));
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

keysCmd
  .command('get <pk>')
  .description('Get key details by public key ID')
  .option('--json', 'Output as JSON')
  .action(async (pk, options) => {
    requireAuth();
    try {
      const key = await withSpinner(`Fetching key ${pk}...`, () => getKey(pk));

      if (!key) {
        printError('Key not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(key);
        return;
      }

      console.log(chalk.bold('\nKey Details\n'));
      console.log('Key ID:      ', chalk.cyan(key.pk || key.kid || pk));
      console.log('Type:        ', key.kty || 'N/A');
      console.log('Algorithm:   ', key.alg || 'N/A');
      console.log('Status:      ', key.status || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

keysCmd
  .command('revoke <pk>')
  .description('Revoke a public key')
  .action(async (pk) => {
    requireAuth();
    try {
      await withSpinner(`Revoking key ${pk}...`, () => revokeKey(pk));
      printSuccess(`Key ${pk} revoked`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

keysCmd
  .command('update <pk>')
  .description('Update a public key')
  .requiredOption('--data <json>', 'Updated key data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (pk, options) => {
    requireAuth();
    let updateData;
    try {
      updateData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const result = await withSpinner(`Updating key ${pk}...`, () => updateKey(pk, updateData));

      if (options.json) {
        printJson(result);
        return;
      }

      printSuccess(`Key ${pk} updated`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// SCOPES
// ============================================================

const scopesCmd = program.command('scopes').description('Manage identity scopes');

scopesCmd
  .command('list')
  .description('List available scopes')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const scopes = await withSpinner('Fetching scopes...', () => listScopes());

      if (options.json) {
        printJson(scopes);
        return;
      }

      const data = Array.isArray(scopes) ? scopes : (scopes ? [scopes] : []);
      printTable(data, [
        { key: 'name', label: 'Name' },
        { key: 'essential', label: 'Essential', format: (v) => v ? 'Yes' : 'No' },
        { key: 'description', label: 'Description' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

scopesCmd
  .command('get <scope-id>')
  .description('Get scope details')
  .option('--json', 'Output as JSON')
  .action(async (scopeId, options) => {
    requireAuth();
    try {
      const scope = await withSpinner(`Fetching scope ${scopeId}...`, () => getScope(scopeId));

      if (!scope) {
        printError('Scope not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(scope);
        return;
      }

      console.log(chalk.bold('\nScope Details\n'));
      console.log('Name:        ', chalk.cyan(scope.name || scopeId));
      console.log('Essential:   ', scope.essential ? chalk.green('Yes') : 'No');
      console.log('Description: ', scope.description || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

scopesCmd
  .command('request')
  .description('Request additional scopes')
  .requiredOption('--data <json>', 'Scope request data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let scopeData;
    try {
      scopeData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const result = await withSpinner('Requesting scope...', () => requestScope(scopeData));

      if (options.json) {
        printJson(result);
        return;
      }

      printSuccess('Scope requested');
      if (result) console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
