export const environment = {
  production: true,
  api: {
    url: 'https://api.deliverai.io',
    host: 'api.deliverai.io',
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
  externalBaseLink: 'https://order.deliverai.io/'
  // externalBaseLink: 'https://widget-demo-277814.ew.r.appspot.com/'
};
