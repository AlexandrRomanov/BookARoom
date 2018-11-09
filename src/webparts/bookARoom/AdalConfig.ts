const adalConfig: adal.Config = {
    clientId: '3accf488-95f1-488e-bf1b-6c08a6af457d',
    tenant: 'dc.gov',
    extraQueryParameter: 'nux=1',
    endpoints: {
      graphApiUri: 'https://graph.microsoft.com'
    },
    postLogoutRedirectUri: window.location.origin,
    cacheLocation: 'sessionStorage'
  };
  
  export default adalConfig;