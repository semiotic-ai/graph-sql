import { createConnection } from '../src';

describe('connection', () => {
  it('should connect to the database', async () => {
    const connection = await createConnection(
      {
        ipfs: 'QmY22FRbSGS6WGzoMimP7h29CyqAJRe6QkrDrpokqVt4R4'
      },
      undefined,
      true
    );
    expect(connection).toBeDefined();
    expect(connection.subgraphInfo.displayName).toBe('Graph EBO Arbitrum');

    const queryresult = await connection.execute('SELECT 1;');
    expect(queryresult).toBeDefined();
    expect(queryresult.data.sql.rows.length).toBe(1);
  });
});
