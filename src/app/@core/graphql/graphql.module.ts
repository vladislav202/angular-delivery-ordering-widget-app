import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppConfigService } from '@app/app-config.service';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import introspectionQueryResultData from './graphql.fragments.g';

export function createApollo(appConfig: AppConfigService, httpLink: HttpLink) {

  const basic = setContext((operation, context) => ({
    headers: {
      Accept: 'charset=utf-8'
    }
  }));

  const ws = new WebSocketLink({
    uri: `wss://${appConfig.getHost()}/subscriptions`,
    options: {
      reconnect: true
    }
  });

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  });

  const http = ApolloLink.from([basic, httpLink.create({ uri: appConfig.graphQlUrl(), withCredentials: true })]);

  const link = split(({ query }) => {
    const { kind, operation }: any = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  }, ws, http);

  const cache = new InMemoryCache({fragmentMatcher});

  return {
    link,
    cache
  };
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [ ApolloModule, HttpLinkModule ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [ AppConfigService, HttpLink ],
    },
  ],
})
export class GraphqlModule {
}
