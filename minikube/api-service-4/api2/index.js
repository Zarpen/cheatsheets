const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require("@apollo/federation");
const { RESTDataSource } = require('apollo-datasource-rest');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    type ItemApi2 {
      item_id: Int
    }
      
    type Query {
      getItemApi2(id: Int!): ItemApi2
    }
`;

class Api2Datasource extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'http://api-service-2-service'
  }

  getItem(itemId) {
    return this.get(`/items/${itemId}`)
  }
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const resolvers = {
  Query: {
    getItemApi2: (root, { id }, { dataSources }) => dataSources.api2.getItem(id)
  }
}

const server = new ApolloServer({
  dataSources: () => ({ api2: new Api2Datasource() }),
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
})

server.listen({ port: 4110 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});