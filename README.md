# 🚀 Aliastron

[![npm version](https://img.shields.io/npm/v/aliastron)](https://www.npmjs.com/package/aliastron)
[![license](https://img.shields.io/npm/l/aliastron)](LICENSE)

A beautiful, interactive CLI tool to manage your Electron application aliases with style!

![Demo](https://img.shields.io/badge/terminal-interactive-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)

## ✨ Features

- 🎨 **Beautiful UI** - Colorful gradients, ASCII art banner, and styled tables
- 🖱️ **Interactive Menus** - Easy-to-use arrow key navigation
- 📋 **List Aliases** - View all your Electron app aliases in a formatted table
- ➕ **Create Aliases** - Add new Electron app shortcuts with validation
- 🗑️ **Remove Aliases** - Multi-select checkboxes to remove multiple aliases at once
- ✅ **Input Validation** - Ensures proper alias names and URLs
- 🔄 **Persistent Storage** - Stores aliases in `~/.electron-apps`
- 🔗 **Auto .bashrc Integration** - Automatically configures your shell

## 📦 Installation

### From npm (Recommended)

```bash
# Install globally
npm install -g aliastron

# Run it
aliastron
# or use aliases
electron-manager
eam
```

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/aliastron.git
cd aliastron

# Install dependencies
npm install

# Run locally
npm start

# Or link globally
npm link
aliastron
```

## 🎮 Usage

Simply run the application:

```bash
node index.js
```

Or if installed globally:

```bash
electron-manager
```

### Menu Options

1. **📋 List all aliases** - Display all configured Electron app aliases
2. **➕ Create new alias** - Add a new Electron app shortcut
3. **🗑️ Remove aliases** - Select and remove one or more aliases
4. **🚪 Exit** - Exit the application

## 🛠️ How It Works

The tool manages aliases in `~/.electron-apps` file and automatically ensures your `.bashrc` sources this file. Each alias is a shortcut that launches an Electron app with a specified URL.

### Example Alias Format

```bash
alias myapp="/usr/lib/electron37/electron https://example.com > /dev/null 2>&1 &"
```

## 📚 Dependencies

- **chalk** - Terminal string styling
- **inquirer** - Interactive command line prompts
- **ora** - Elegant terminal spinners
- **boxen** - Create boxes in the terminal
- **gradient-string** - Beautiful gradient text
- **figlet** - ASCII art text
- **cli-table3** - Pretty tables for the terminal

## 🎨 Screenshots

The app features:
- Colorful ASCII art banner
- Gradient colored text
- Beautiful boxed messages
- Formatted tables with borders
- Smooth spinners for operations
- Interactive checkboxes and lists

## 📝 Notes

After creating or removing aliases, remember to either:
- Open a new terminal, OR
- Run: `source ~/.electron-apps`

## 📄 License

MIT
