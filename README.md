# :zap: Nodejin

### A CLI to bootstrap node projects for quick prototyping

## Installation

```shell
npm install -g nodejin
```

## Usage

```shell
nodejin <template> [options]
```

### Example

```shell
nodejin express --yes
```

## Current templates

- Express
- Koa

more templates and features currently in the works.

| options       | alias | default | description                                                       |
| ------------- | ----- | ------- | ----------------------------------------------------------------- |
| --git         | -g    | true    | Initilize git repository                                          |
| --skipInstall | -si   | false   | Skip installing dependencies                                      |
| --yes         | -y    | false   | Skip prompts and use the default options and the default template |
