import { graphql, GraphQLSchema, ExecutionResult } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

export type GraphQLOptions<Context = any, Request = any> = {
  schema: GraphQLSchema
  context?: (val: Request) => Context | Promise<Context>
  rootValue?: any
}

interface Params {
  variables?: Record<string, unknown>
  operationName?: string
}

interface QueryParams extends Params {
  query: string
  mutation?: never
}

interface MutationParams extends Params {
  mutation: string
  query?: never
}

export type GraphQLParams = QueryParams | MutationParams

/**
 * Execute a GraphQL query
 * @param {GraphQLParams} params
 * @param {GraphQLOptions} options
 * @param context GraphQL context to use inside resolvers
 *
 * @example
 * ```ts
 * const { errors, data } = await runHttpQuery<ServerRequest, typeof context>({ query: `{ hello }` }, { schema } }, context)
 * ```
 */
export async function runHttpQuery<Req extends any = any, Context extends { request: Req } = { request: Req }>(
  params: GraphQLParams,
  options: GraphQLOptions<Context, Req>,
  context?: Context | any
): Promise<ExecutionResult> {
  const contextValue = options.context && context?.request ? await options.context?.(context?.request) : context
  const source = params.query! || params.mutation!

  return await graphql({
    source,
    ...options,
    contextValue,
    variableValues: params.variables,
    operationName: params.operationName
  })
}
