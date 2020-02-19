const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require("@apollo/federation");
const { RESTDataSource } = require('apollo-datasource-rest');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    type ItemApi3 {
      item_id: Int
    }
      
    type Query {
      getItemApi3(id: Int!): ItemApi3
    }
`;

class Api3Datasource extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'http://api-service-3-service'
  }

  getItem(itemId) {
    return this.get(`/items/${itemId}`)
  }
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const resolvers = {
  Query: {
    getItemApi3: (root, { id }, { dataSources }) => dataSources.api3.getItem(id)
  }
}

const server = new ApolloServer({
  dataSources: () => ({ api3: new Api3Datasource(), api3: new Api3Datasource() }),
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
})

server.listen({ port: 4111 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});