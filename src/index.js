import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import { createKey, getKey, deleteKey, updateKey, createScope, getScope } from './api.js';

const program = new Command();

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
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

program
  .name('authentiq')
  .description(chalk.bold('Authentiq CLI') + ' - Strong authentication without passwords')
  .version('1.0.0');

// CONFIG
const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Set API key')
  .option('--base-url <url>', 'Set base URL (optional)')
  .action((options) => {
    const updates = {};
    if (options.apiKey) updates.apiKey = options.apiKey;
    if (options.baseUrl) updates.baseUrl = options.baseUrl;

    setConfig(updates);
    printSuccess('Configuration updated');
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const config = getConfig();
    console.log(chalk.bold('\nCurrent configuration:'));
    console.log('  API Key:', config.apiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set'));
    console.log('  Base URL:', config.baseUrl);
  });

// KEY COMMANDS
const keyCmd = program.command('key').description('Manage authentication keys');

keyCmd
  .command('create')
  .description('Create a new key')
  .option('--data <json>', 'Key data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const body = options.data ? JSON.parse(options.data) : {};
      const data = await withSpinner('Creating key...', () => createKey(body));
      
      if (options.json) {
        printJson(data);
      } else {
        printSuccess('Key created');
        console.log(data);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

keyCmd
  .command('get')
  .description('Get a key by public key')
  .argument('<pk>', 'Public key')
  .option('--json', 'Output as JSON')
  .action(async (pk, options) => {
    try {
      const data = await withSpinner('Fetching key...', () => getKey(pk));
      
      if (options.json) {
        printJson(data);
      } else {
        console.log(chalk.bold.cyan('\nKey Information:\n'));
        console.log(data);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

keyCmd
  .command('delete')
  .description('Delete a key')
  .argument('<pk>', 'Public key')
  .action(async (pk) => {
    try {
      await withSpinner('Deleting key...', () => deleteKey(pk));
      printSuccess('Key deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

keyCmd
  .command('update')
  .description('Update a key')
  .argument('<pk>', 'Public key')
  .option('--data <json>', 'Update data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (pk, options) => {
    try {
      const body = options.data ? JSON.parse(options.data) : {};
      const data = await withSpinner('Updating key...', () => updateKey(pk, body));
      
      if (options.json) {
        printJson(data);
      } else {
        printSuccess('Key updated');
        console.log(data);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// SCOPE COMMANDS
const scopeCmd = program.command('scope').description('Manage authentication scopes');

scopeCmd
  .command('create')
  .description('Create a new scope request')
  .option('--data <json>', 'Scope data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const body = options.data ? JSON.parse(options.data) : {};
      const data = await withSpinner('Creating scope...', () => createScope(body));
      
      if (options.json) {
        printJson(data);
      } else {
        printSuccess('Scope created');
        console.log(data);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

scopeCmd
  .command('get')
  .description('Get scope status')
  .argument('<job>', 'Job ID')
  .option('--json', 'Output as JSON')
  .action(async (job, options) => {
    try {
      const data = await withSpinner('Fetching scope...', () => getScope(job));
      
      if (options.json) {
        printJson(data);
      } else {
        console.log(chalk.bold.cyan('\nScope Status:\n'));
        console.log(data);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

program.parse();
