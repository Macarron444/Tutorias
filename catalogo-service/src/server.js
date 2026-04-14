const app = require('./app');
const Eureka = require('eureka-js-client').Eureka;

const PORT = 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);

  // Configuración del cliente para Eureka
  const client = new Eureka({
    instance: {
      app: 'CATALOGO-SERVICE',
      hostName: 'catalogo-service',
      ipAddr: 'catalogo-service',
      statusPageUrl: 'http://catalogo-service:3000',
      port: {
        '$': PORT,
        '@enabled': 'true',
      },
      vipAddress: 'catalogo-service',
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: 'eureka-server',
      port: 8761,
      servicePath: '/eureka/apps/'
    }
  });

  client.logger.level('warn');
  client.start((error) => {
    if (error) {
      console.log('Error de Eureka: ' + error);
    } else {
      console.log('¡Eureka client registration complete!');
    }
  });
});
