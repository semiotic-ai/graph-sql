// Connection to the SQL enabled subgraph through the SQL gateway

import {
  ISubgraphInfo,
  getSqlEnabledDeployments,
  findSubgraph,
  ISubgraph,
  executeSubgraphSql,
  IQueryResult
} from './subgraph';

const NETWORK_SUBGRAPH_API =
  'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-arbitrum';

const NETWORK_SUBGRAPH_TESTNET_API =
  'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-arbitrum-sepolia';

const SQL_GATEWAY_URL = 'https://sql.gateway.thegraph.semiotic.ai';

/**
 * Create a connection to a SQL enabled subgraph
 * @param apiKey API key for sql enabled gateway
 * @param subgraph Subgraph to connect to
 * @param testnet Use testnet subgraph
 * @param abortSignal Abort signal
 * @returns Connection to the subgraph
 */
export async function createConnection(
  subgraph: ISubgraph,
  apiKey?: string,
  testnet?: boolean,
  abortSignal?: AbortSignal
): Promise<SqlSubgraphConnection> {
  const endpoint = testnet ? NETWORK_SUBGRAPH_TESTNET_API : NETWORK_SUBGRAPH_API;

  apiKey = apiKey || process.env.GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      'API key is required, either pass it as an argument or set GATEWAY_API_KEY env variable'
    );
  }

  const subgraphInfo = await findSubgraph(endpoint, subgraph, abortSignal);

  if (!subgraphInfo) {
    throw new Error('Subgraph not found');
  }

  const sqlIndexerCount = await SqlSubgraphConnection.getSqlIndexerCount(subgraphInfo, abortSignal);

  if (sqlIndexerCount === 0) {
    throw new Error('Subgraph does not have any SQL enabled deployments');
  }

  return new SqlSubgraphConnection(apiKey, subgraphInfo);
}

/**
 * Connection to a SQL enabled subgraph
 */
export class SqlSubgraphConnection {
  private readonly _authorization: string;
  private readonly _endpoint: string;
  private readonly _subgraphInfo: ISubgraphInfo;

  private static _sqlEnabledDeployments?: Map<string, number>;

  public static async getSqlIndexerCount(
    subgraph: ISubgraphInfo,
    abortSignal?: AbortSignal
  ): Promise<number> {
    if (!this._sqlEnabledDeployments) {
      this._sqlEnabledDeployments = await getSqlEnabledDeployments(SQL_GATEWAY_URL, abortSignal);
    }
    return this._sqlEnabledDeployments.get(subgraph.ipfsHash) || 0;
  }

  constructor(apiKey: string, subgraphInfo: ISubgraphInfo) {
    this._authorization = `Bearer ${apiKey}`;
    this._subgraphInfo = subgraphInfo;
    this._endpoint = `${SQL_GATEWAY_URL}/api/deployments/id/${subgraphInfo.deploymentId}`;
  }

  /**
   * Information about the subgraph
   */
  public get subgraphInfo(): ISubgraphInfo {
    return this._subgraphInfo;
  }

  /**
   * Execute a SQL query on the subgraph
   * @param query SQL query
   * @param abortSignal Abort signal
   * @returns Query result
   */
  public execute(query: string, abortSignal?: AbortSignal): Promise<IQueryResult> {
    return executeSubgraphSql(this._endpoint, query, abortSignal, this._authorization);
  }
}
