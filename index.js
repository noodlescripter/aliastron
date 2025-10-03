#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';
import Table from 'cli-table3';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

const BASHRC = path.join(os.homedir(), '.bashrc');
const ALIASES_FILE = path.join(os.homedir(), '.electron-apps');
const INCLUDE_LINE = '[ -f "$HOME/.electron-apps" ] && source "$HOME/.electron-apps"';

// Beautiful gradient colors
const coolGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']);
const successGradient = gradient(['#00F260', '#0575E6']);
const errorGradient = gradient(['#FF416C', '#FF4B2B']);

// Display welcome banner
async function showBanner() {
  console.clear();
  const banner = figlet.textSync('Electron Manager', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  console.log(coolGradient.multiline(banner));
  console.log(boxen(
    chalk.white.bold('🚀 Manage your Electron apps with style!'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#1a1a2e'
    }
  ));
}

// Ensure the include line exists in .bashrc
async function ensureInclude() {
  try {
    let bashrcContent = '';
    try {
      bashrcContent = await fs.readFile(BASHRC, 'utf-8');
    } catch (err) {
      // .bashrc doesn't exist, create it
      await fs.writeFile(BASHRC, '');
    }

    if (!bashrcContent.includes(INCLUDE_LINE)) {
      const addition = `\n# Load custom Electron app aliases\n${INCLUDE_LINE}\n`;
      await fs.appendFile(BASHRC, addition);
    }
  } catch (error) {
    console.error(chalk.red('Error ensuring .bashrc include:'), error.message);
  }
}

// Parse aliases from file
async function readAliases() {
  try {
    const content = await fs.readFile(ALIASES_FILE, 'utf-8');
    const lines = content.split('\n');
    const aliases = [];

    for (const line of lines) {
      const aliasMatch = line.match(/^\s*alias\s+([A-Za-z0-9_.:-]+)=(.+)$/);
      if (aliasMatch) {
        const name = aliasMatch[1];
        let command = aliasMatch[2].trim();
        // Remove quotes
        command = command.replace(/^["']|["']$/g, '');
        aliases.push({ name, command });
      }
    }

    return aliases;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Display aliases in a beautiful table
async function listAliases() {
  const spinner = ora('Loading aliases...').start();
  
  try {
    const aliases = await readAliases();
    spinner.stop();

    if (aliases.length === 0) {
      console.log(boxen(
        chalk.yellow('📭 No aliases found yet!\n\nCreate your first Electron app alias to get started.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow'
        }
      ));
      return aliases;
    }

    const table = new Table({
      head: [
        chalk.cyan.bold('№'),
        chalk.cyan.bold('Alias Name'),
        chalk.cyan.bold('Command')
      ],
      style: {
        head: [],
        border: ['cyan']
      },
      colWidths: [5, 25, 50]
    });

    aliases.forEach((alias, index) => {
      table.push([
        chalk.white(index + 1),
        chalk.green.bold(alias.name),
        chalk.gray(alias.command.substring(0, 47) + (alias.command.length > 47 ? '...' : ''))
      ]);
    });

    console.log('\n' + table.toString() + '\n');
    return aliases;
  } catch (error) {
    spinner.fail(chalk.red('Failed to load aliases'));
    console.error(chalk.red(error.message));
    return [];
  }
}

// Create a new alias
async function createAlias() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: chalk.cyan('Enter alias name:'),
      validate: (input) => {
        if (!input.trim()) return 'Alias name cannot be empty';
        if (!/^[A-Za-z0-9_.:-]+$/.test(input)) {
          return 'Alias name can only contain letters, numbers, dots, underscores, colons, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'url',
      message: chalk.cyan('Enter application URL or path:'),
      validate: (input) => {
        if (!input.trim()) return 'URL/path cannot be empty';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (answers) => chalk.yellow(`Create alias '${chalk.bold(answers.name)}' for '${chalk.bold(answers.url)}'?`),
      default: true
    }
  ]);

  if (!answers.confirm) {
    console.log(chalk.yellow('✖ Operation cancelled'));
    return;
  }

  const spinner = ora('Creating alias...').start();

  try {
    await ensureInclude();
    
    // Read existing content
    let content = '';
    try {
      content = await fs.readFile(ALIASES_FILE, 'utf-8');
    } catch (err) {
      // File doesn't exist yet
    }

    // Remove any existing alias with the same name
    const lines = content.split('\n').filter(line => {
      const match = line.match(/^\s*alias\s+([A-Za-z0-9_.:-]+)=/);
      return !match || match[1] !== answers.name;
    });

    // Add new alias
    const newAlias = `alias ${answers.name}="/usr/lib/electron37/electron ${answers.url} > /dev/null 2>&1 &"`;
    lines.push(newAlias);

    await fs.writeFile(ALIASES_FILE, lines.join('\n') + '\n');

    spinner.succeed(successGradient('Alias created successfully! ✨'));
    
    console.log(boxen(
      chalk.white(`Alias: ${chalk.green.bold(answers.name)}\n`) +
      chalk.white(`URL: ${chalk.blue(answers.url)}\n\n`) +
      chalk.yellow(`⚠️  Run: ${chalk.bold('source ~/.electron-apps')} or open a new terminal to use it`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create alias'));
    console.error(chalk.red(error.message));
  }
}

// Remove aliases
async function removeAliases() {
  const aliases = await readAliases();

  if (aliases.length === 0) {
    console.log(chalk.yellow('No aliases to remove'));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: chalk.cyan('Select aliases to remove:'),
      choices: aliases.map((alias, index) => ({
        name: `${chalk.green(alias.name)} → ${chalk.gray(alias.command.substring(0, 40))}`,
        value: alias.name,
        short: alias.name
      })),
      validate: (input) => {
        if (input.length === 0) return 'Please select at least one alias';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (answers) => chalk.red(`Remove ${chalk.bold(answers.selected.length)} alias(es)?`),
      default: false
    }
  ]);

  if (!answers.confirm) {
    console.log(chalk.yellow('✖ Operation cancelled'));
    return;
  }

  const spinner = ora('Removing aliases...').start();

  try {
    const content = await fs.readFile(ALIASES_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => {
      const match = line.match(/^\s*alias\s+([A-Za-z0-9_.:-]+)=/);
      return !match || !answers.selected.includes(match[1]);
    });

    await fs.writeFile(ALIASES_FILE, lines.join('\n') + '\n');

    spinner.succeed(successGradient(`Removed ${answers.selected.length} alias(es) successfully! 🗑️`));
    
    console.log(boxen(
      chalk.white('Removed aliases:\n') +
      answers.selected.map(name => chalk.red('  ✖ ' + name)).join('\n') +
      chalk.yellow('\n\n⚠️  Run: ') + chalk.bold('source ~/.electron-apps') + chalk.yellow(' to apply changes'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red'
      }
    ));
  } catch (error) {
    spinner.fail(chalk.red('Failed to remove aliases'));
    console.error(chalk.red(error.message));
  }
}

// Main menu
async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan.bold('What would you like to do?'),
      choices: [
        {
          name: chalk.green('📋 List all aliases'),
          value: 'list',
          short: 'List'
        },
        {
          name: chalk.blue('➕ Create new alias'),
          value: 'create',
          short: 'Create'
        },
        {
          name: chalk.red('🗑️  Remove aliases'),
          value: 'remove',
          short: 'Remove'
        },
        new inquirer.Separator(),
        {
          name: chalk.gray('🚪 Exit'),
          value: 'exit',
          short: 'Exit'
        }
      ],
      loop: false
    }
  ]);

  switch (action) {
    case 'list':
      await listAliases();
      break;
    case 'create':
      await createAlias();
      break;
    case 'remove':
      await removeAliases();
      break;
    case 'exit':
      console.log(boxen(
        gradient.pastel.multiline('👋 Thanks for using Electron Manager!\n   See you next time!'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'magenta'
        }
      ));
      process.exit(0);
  }

  // Show menu again
  const { continue: cont } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: chalk.cyan('Return to main menu?'),
      default: true
    }
  ]);

  if (cont) {
    console.clear();
    await showBanner();
    await mainMenu();
  } else {
    console.log(gradient.pastel('👋 Goodbye!\n'));
    process.exit(0);
  }
}

// Main execution
async function main() {
  try {
    await showBanner();
    await mainMenu();
  } catch (error) {
    if (error.isTtyError) {
      console.error(chalk.red('Prompt couldn\'t be rendered in the current environment'));
    } else {
      console.error(chalk.red('An error occurred:'), error.message);
    }
    process.exit(1);
  }
}

main();
