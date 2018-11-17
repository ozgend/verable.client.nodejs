const net = require('net');
const clientSocket = new net.Socket();

const Command = {
    Register: "REG",
    Deregister: "DRG",
    DiscoverOne: "DS1",
    DiscoverN: "DSN",
    DiscoverAll: "DSA",
    Heartbeat: "HRB",
    Seperator: "|"
}

class VerableBeacon {

    constructor(host, port) {
        this._host = host || 'localhost';
        this._port = port || 9009;
        this.registrationId = null;
    }

    async register(serviceDefinition) {
        let request = this._pack(Command.Register, serviceDefinition, true);
        let response = await this._send(request, true);
        this.registrationId = this._unpack(response);
        return this.registrationId;
    }

    async deregister(regId) {
        let request = this._pack(Command.Deregister, regId || this.registrationId);
        await this._send(request);
        this.registrationId = null;
    }

    async discover(serviceName) {
        var request;

        if (serviceName) {
            let typeName = typeof serviceName;
            let command = typeName === "object" ? Command.DiscoverN : Command.DiscoverOne;
            let willSerialize = typeName === "object";
            request = this._pack(command, serviceName, willSerialize);
        }
        else {
            request = this._pack(Command.DiscoverAll);
        }

        let response = await this._send(request, true);
        let result = this._unpack(response, true);
        return result;
    }

    _send(data, expectResponse) {

        const socket = new net.Socket();
        const beacon = this;

        return new Promise((resolve, reject) => {

            socket.connect(beacon._port, beacon._host, () => {
                socket.write(data);
                if (!expectResponse) {
                    //socket.end();
                    resolve(data);
                }
            });

            if (expectResponse) {
                socket.on('data', (data) => {
                    resolve(data);
                });
            }

            socket.on('error', (err) => {
                reject(err);
            });

        });
    }

    _pack(command, data, requireSerialization) {
        let packet = new BeaconPacket();
        packet.command = command;
        packet.serialized = requireSerialization;

        if (data) {
            packet.data = requireSerialization
                ? JSON.stringify(data)
                : data;
        }

        let stringified = packet.toString();
        let encoded = Buffer.from(stringified).toString('base64');
        return encoded;
    }

    _unpack(encoded, expectSerialized) {
        if (!encoded) {
            return;
        }

        let stringified = Buffer.from(encoded, 'base64').toString('ascii');
        stringified = Buffer.from(stringified, 'base64').toString('ascii');

        let data = expectSerialized
            ? JSON.parse(stringified)
            : stringified;

        return data;
    }
}

class BeaconPacket {

    constructor() {
        this.data;
        this.command = '';
        this.serialized = false;
    }

    toString() {
        return this.command + Command.Seperator + (this.serialized ? 1 : 0) + Command.Seperator + this.data;
    }
}

module.exports = VerableBeacon;