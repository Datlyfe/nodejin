import Koa from "koa";
import cors from "@koa/cors";
import bp from "koa-bodyparser";

import { ApolloServer } from "apollo-server-koa";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/schema";

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bp());

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });
const serverPath = `http://localhost:${port}${server.graphqlPath}`;

app.listen(port, () => {
  console.log(`🚀 Server ready at ${serverPath}`);
});
