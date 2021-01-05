export const environment = {
  production: true,
  api: {
    url: 'https://api.dev.deliverai.io',
    host: 'api.dev.deliverai.io',
    graphQL: {
      endpoint: 'graphql'
    },
  },
  security: {
    xsrf: {
      cookie: 'XSRF-TOKEN',
      header: 'X-XSRF-TOKEN'
    }
  },
  router: {
    tracing: {
      enabled: true
    }
  },
  externalBaseLink: 'https://order.dev.deliverai.io/'
};
