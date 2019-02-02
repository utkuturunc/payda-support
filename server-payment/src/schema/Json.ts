import { gql } from "apollo-server-core";
import GraphQLJSON from "graphql-type-json";

export const typeDef = gql`
  scalar JSON
`;

export const resolvers = {
  JSON: GraphQLJSON
};
