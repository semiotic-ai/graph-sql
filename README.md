<h1 align="center" style="border-bottom: none;">
graph-sql</h1>
<h3 align="center">Discovery and execution services API for sql enabled graph protocol subgraphs</h3>
<p align="center">
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
  <a href="https://github.com/semiotic-ai/graph-sql/actions">
    <img alt="Actions Status" src="https://github.com/semiotic-ai/graph-sql/workflows/CI/badge.svg">
  </a>
  <a href="https://github.com/semiotic-ai/graph-sql/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/semiotic-ai/graph-sql">
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@semiotic-labs/graph-sql">
    <img alt="npm install" src="https://img.shields.io/badge/npm%20i-graph--tables-brightgreen">
  </a>
  <a href="https://github.com/semiotic-ai/graph-sql/tags">
    <img alt="version" src="https://img.shields.io/npm/v/@semiotic-labs/graph-sql?color=green&label=version">
  </a>
</p>

## Highlights
- Discovery API 
- SQL execution API
- Package include CommonJS, ES Modules, UMD version and TypeScript declaration files.

## Install

```sh
npm install @semiotic-labs/graph-sql
```

## Usage

```ts
import {createConnection} from '@semiotic-labs/graph-sql';

const connection = await createConnection(
  {
    displayName: 'Graph EBO Arbitrum'
  },
  undefined,
  true
);

 const queryresult = await connection.execute('SELECT 1;');
 
```

## Gateway API Key

SQL query execution requires API key for sql enabled gateway. Get your API keys
from https://sql.semiotic.ai .