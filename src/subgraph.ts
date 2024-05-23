// This file contains the functions to search for subgraphs by different criteria from a graph network subgraph API endpoint

/*
 * Basic subgraph and current version/deployment information
 */
export interface ISubgraphInfo {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly image: string;
  readonly currentVersion: string;
  readonly deploymentId: string;
  readonly network: string;
  readonly deploymentSchemaId: string;
  readonly activeIndexerAllocations: number;
  readonly ipfsHash: string;
  readonly sqlIndexers?: number;
}

export interface ISubgraphQuery {
  readonly query: string;
  readonly variables: Record<string, unknown>;
  readonly operationName: string;
  readonly extensions: Record<string, unknown>;
}

function cheapCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Calls a GraphQL endpoint with the given body and returns the response.
 * @param endpoint GraphQL endpoint
 * @param body Query or mutation body
 * @param abortSignal Abort signal to cancel the request
 * @param authorization  Authorization header value
 * @returns
 */
async function callGraphQL<B, R>(
  endpoint: string,
  body: B,
  abortSignal?: AbortSignal,
  authorization?: string
): Promise<R> {
  const response = await fetch(endpoint, {
    headers: {
      accept: 'application/graphql-response+json, application/json, multipart/mixed',
      'accept-language': 'en-US,en;q=0.5',
      'content-type': 'application/json',
      Authorization: authorization || ''
    },
    body: JSON.stringify(body),
    method: 'POST',
    signal: abortSignal
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GraphQL endpoint: ${response.statusText}`);
  }

  const json_response: any = await response.json();

  if (Object.hasOwn(json_response, 'errors')) {
    throw new Error(json_response.errors.map((e: any) => e.message).join('\n'));
  }

  //@ts-ignore
  const result: R = json_response as R;

  return result;
}

// Search from subgraphs entity in the network subgraph
const SEARCH_TEMPLATE_SUBGRAPHS: ISubgraphQuery = {
  query: `query SearchGeneric($where:Subgraph_filter!) {
        subgraphs(where:$where) {
            id
    		    metadata {
              displayName
              description
              image
            }
            currentVersion {
              id
              version
              subgraphDeployment {
                id
                ipfsHash
                indexerAllocations(where: {activeForIndexer_not: null}) {
                  activeForIndexer {
                    id
                  }
                }
                manifest {
                  network
                  schema {
                    id
                  }
                }
              }
            }
          }
        }
    `,
  variables: { where: {} },
  operationName: 'SearchGeneric',
  extensions: {}
};

interface ISubgraphsSearchResult {
  readonly data: {
    readonly subgraphs: {
      readonly id: string;
      readonly metadata: {
        readonly displayName: string;
        readonly description: string;
        readonly image: string;
      };
      readonly currentVersion: {
        readonly id: string;
        readonly version: number;
        readonly subgraphDeployment: {
          readonly id: string;
          readonly ipfsHash: string;
          readonly indexerAllocations: {
            readonly activeForIndexer: {
              readonly id: string;
            };
          }[];
          readonly manifest: {
            readonly network: string;
            readonly schema: {
              readonly id: string;
            };
          };
        };
      };
    }[];
  };
}

async function findFromSubgraphs(
  endpoint: string,
  where: any,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo[]> {
  const body = cheapCopy(SEARCH_TEMPLATE_SUBGRAPHS);

  body.variables.where = where;

  const json_response: ISubgraphsSearchResult = await callGraphQL(endpoint, body, abortSignal);

  const result: ISubgraphInfo[] = json_response.data.subgraphs.map((subgraph) => {
    return {
      id: subgraph.id,
      displayName: subgraph.metadata.displayName,
      description: subgraph.metadata.description,
      image: subgraph.metadata.image,
      currentVersion: subgraph.currentVersion.id,
      deploymentId: subgraph.currentVersion.subgraphDeployment.id,
      network: subgraph.currentVersion.subgraphDeployment.manifest.network,
      deploymentSchemaId: subgraph.currentVersion.subgraphDeployment.manifest.schema.id,
      ipfsHash: subgraph.currentVersion.subgraphDeployment.ipfsHash,
      activeIndexerAllocations: subgraph.currentVersion.subgraphDeployment.indexerAllocations.length
    };
  });

  return result;
}

async function findSubgraphByDisplayName(
  endpoint: string,
  displayName: string,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo | undefined> {
  const where = { metadata_: { displayName: displayName } };

  const result = await findFromSubgraphs(endpoint, where, abortSignal);

  return result.length > 0 ? result[0] : undefined;
}

async function findSubgraphById(
  endpoint: string,
  id: string,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo | undefined> {
  const where = { id: id };

  const result = await findFromSubgraphs(endpoint, where, abortSignal);

  return result.length > 0 ? result[0] : undefined;
}

async function findSubgraphByCurrentVersion(
  endpoint: string,
  currentVersionId: string,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo | undefined> {
  const where = { currentVersion_: { id: currentVersionId } };

  const result = await findFromSubgraphs(endpoint, where, abortSignal);

  return result.length > 0 ? result[0] : undefined;
}

// Due to child filter nesting not supported join on subgraphDeployment we add another template
// Search from subgraphDeployments entity in the network subgraph
const SEARCH_TEMPLATE_DEPLOYMENTS: ISubgraphQuery = {
  query: `query SearchGeneric($where:SubgraphDeployment_filter!) {
        deployments: subgraphDeployments(where: $where) {
          id
          ipfsHash
          indexerAllocations(where: {activeForIndexer_not: null}) {
            activeForIndexer {
              id
            }
          }
          manifest {
            network
            schema {
              id
            }
          }
          versions {
            id
            version
            subgraph {
              id
              metadata {
                displayName
                image
                description
              }
            }
          }
        }
      }`,
  variables: { where: {} },
  operationName: 'SearchGeneric',
  extensions: {}
};

interface IDeploymentSearchResult {
  readonly data: {
    readonly deployments: {
      readonly id: string;
      readonly ipfsHash: string;
      readonly indexerAllocations: {
        readonly activeForIndexer: {
          readonly id: string;
        };
      }[];
      readonly manifest: {
        readonly schema: {
          readonly id: string;
        };
        readonly network: string;
      };
      readonly versions: {
        readonly id: string;
        readonly version: number;
        readonly subgraph: {
          readonly id: string;
          readonly metadata: {
            readonly id: string;
            readonly displayName: string;
            readonly image: string;
            readonly description: string;
          };
        };
      }[];
    }[];
  };
}

async function findFromDeployments(
  endpoint: string,
  where: any,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo[]> {
  const body = cheapCopy(SEARCH_TEMPLATE_DEPLOYMENTS);

  body.variables.where = where;

  const json_response: IDeploymentSearchResult = await callGraphQL(endpoint, body, abortSignal);

  const result: ISubgraphInfo[] = json_response.data.deployments.map((deployment) => {
    const result: ISubgraphInfo = {
      id: deployment.versions[0].subgraph.id,
      displayName: deployment.versions[0].subgraph.metadata.displayName,
      description: deployment.versions[0].subgraph.metadata.description,
      image: deployment.versions[0].subgraph.metadata.image,
      currentVersion: deployment.versions[0].id,
      deploymentId: deployment.id,
      network: deployment.manifest.network,
      deploymentSchemaId: deployment.manifest.schema.id,
      ipfsHash: deployment.ipfsHash,
      activeIndexerAllocations: deployment.indexerAllocations.length
    };
    return result;
  });

  return result;
}

async function findSubgraphByDeploymentId(
  endpoint: string,
  deploymentId: string,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo | undefined> {
  const where = { id: deploymentId };

  const result = await findFromDeployments(endpoint, where, abortSignal);

  return result.length > 0 ? result[0] : undefined;
}

async function findSubgraphByIpfsHash(
  endpoint: string,
  ipfsHash: string,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo | undefined> {
  const where = { ipfsHash: ipfsHash };

  const result = await findFromDeployments(endpoint, where, abortSignal);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Subgraph match fields
 */
export interface ISubgraph {
  /**
   *  The subgraph id (ie: DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp)
   */
  id?: string;
  /**
   * Exact display name of the subgraph (ie: Graph Network Arbitrum)
   * REMARKS: This is not unique, returns the first match
   */
  displayName?: string;
  /**
   * The subgraph current version id (ie: DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp-1)
   */
  version?: string;
  /**
   * The subgraph deployment id (ie: 0xab90a94d90bf57554adbbaec92fade3bccebd4dad4e00179c3de560f6c6fa5b0)
   */
  deployment?: string;
  /**
   * The subgraph ipfs hash (ie: QmZtNN8NbxjJ1KD5uKBYa7Gj29CT8xypSXnAmXbrLNTQgX)
   */
  ipfs?: string;
}

/**
 * Finds a subgraph by the given subgraph field
 * @param endpoint url of the graph network subgraph API endpoint (ie: https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-arbitrum)
 * @param subgraphIdentifier the subgraph identifier to match by (ie: {displayName: 'Graph Network Arbitrum'})
 * @param abortSignal signal to cancel the request
 * @returns `ISubgraphInfo` matching the subgraph identifier
 */
export async function findSubgraph(
  endpoint: string,
  subgraph: ISubgraph,
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo | undefined> {
  let subgraphInfo: ISubgraphInfo | undefined;

  if (subgraph.id) {
    subgraphInfo = await findSubgraphById(endpoint, subgraph.id, abortSignal);
  } else if (subgraph.displayName) {
    subgraphInfo = await findSubgraphByDisplayName(endpoint, subgraph.displayName, abortSignal);
  } else if (subgraph.version) {
    subgraphInfo = await findSubgraphByCurrentVersion(endpoint, subgraph.version, abortSignal);
  } else if (subgraph.deployment) {
    subgraphInfo = await findSubgraphByDeploymentId(endpoint, subgraph.deployment, abortSignal);
  } else if (subgraph.ipfs) {
    subgraphInfo = await findSubgraphByIpfsHash(endpoint, subgraph.ipfs, abortSignal);
  } else {
    throw new Error(
      'subgraph must have one of these fields defined: id, displayName, version, deployment or ipfs hash'
    );
  }

  return subgraphInfo;
}

/**
 * Search for subgraphs by name or description from a graph network subgraph API endpoint
 * @param endpoint url of the graph network subgraph API endpoint (ie: https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-arbitrum)
 * @param ipfs_list Array of deployment ipfs hashes of the subgraphs
 * @param abortSignal signal to cancel the request
 * @returns a list of `ISubgraphInfo` matching the search criteria
 */
export function searchSubgraphByIpfsHashes(
  endpoint: string,
  ipfs_list: string[],
  abortSignal?: AbortSignal
): Promise<ISubgraphInfo[]> {
  const where = { ipfsHash_in: ipfs_list };

  return findFromDeployments(endpoint, where, abortSignal);
}

/**
 * Fetches the sql enabled subgraphs deployment ipfs hashes and number of indexer providing sql service from the gateway
 * @param gatewayUrl url of sql enabled the gateway (ie: https://sql-gateway.api.thegraph.com)
 * @param abortSignal signal to cancel the request
 * @returns a map of subgraph deployment ipfs hash to the number of indexers providing sql service
 */
export async function getSqlEnabledDeployments(
  gatewayUrl: string,
  abortSignal?: AbortSignal
): Promise<Map<string, number>> {
  try {
    const response = await fetch(`${gatewayUrl}/discovery?service_type=Sql`, {
      signal: abortSignal
    });
    const json_response: any = await response.json();
    return new Map(Object.entries(json_response));
  } catch (error) {
    throw new Error('Failed to fetch sql enabled subgraphs from gateway.');
  }
}

const SQL_QUERY_TEMPLATE: ISubgraphQuery = {
  query: `query SQL($query: String!) {
    sql(input: {query: $query}) {
      ... on SqlJSONOutput {
        columns
        rows
        rowCount
      }
    }
  }`,
  variables: { query: '' },
  operationName: 'SQL',
  extensions: {}
};

export interface IQueryResult {
  readonly data: {
    readonly sql: {
      readonly rowCount: number;
      readonly rows: [{ (key: string): string | number }];
      readonly columns: string[];
    };
  };
}

/**
 * Executes a SQL query on a SQL enabled graph-node
 * @param endpoint url of the graphql endpoint of subgraph
 * @param query SQL query to execute
 * @param abortSignal signal to cancel the request
 * @returns result of the query
 */
export async function executeSubgraphSql(
  endpoint: string,
  query: string,
  abortSignal?: AbortSignal,
  authorization?: string
): Promise<IQueryResult> {
  const body = cheapCopy(SQL_QUERY_TEMPLATE);

  body.variables.query = query;

  const json_response: IQueryResult = await callGraphQL(endpoint, body, abortSignal, authorization);

  return json_response;
}
