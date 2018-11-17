const VerableBeacon = require('./verable-beacon');
const verableBeacon = new VerableBeacon('localhost', 9009);

async function main() {

    console.log('running');

    let definition = { Endpoint: 'http://localhost:9901', Name: 'nodejs-backend', Version: '1.0' };
    let id = await verableBeacon.register(definition);
    console.log('Register %s id:%s', definition.Name, id);

    let discoverOne = await verableBeacon.discover('nodejs-backend');
    console.log('Discover One: %j', discoverOne);

    let discoverN = await verableBeacon.discover(['Service1', 'Service2']);
    console.log('Discover N: %j', discoverN);

    let discoverAll = await verableBeacon.discover();
    console.log('Discover All: %j', discoverAll);

    await verableBeacon.deregister();
    console.log('Deregister');

    console.log('awaiting...');
}

main();

