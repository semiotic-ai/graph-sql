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
import {parse} from '@semiotic-labs/graph-sql';

const simple_schema = `
    type SomeComplexTableErc20Name  @entity {
        "Some description about a string field"
        id: ID!,
        nullableField:Boolean,
        booleanField:Boolean!,
        bigIntField:BigInt!,
        bytesField:Bytes!,
        bigDecimalField:BigDecimal!,
        intField:Int!,
        int8Field:Int8!,
        stringField:String!
    }
`;

const layout = parse(simple_schema);
```