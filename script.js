class Peer {
    constructor(name, server, type) {// host , guest
        this.cfg = {'iceServers': [{"url": "stun:stun.xten.com"}]},
        this.con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] }
        this.name = name;
        this.server = server;
        this.type = type;
    }

    init() {
        this.conn = new RTCPeerConnection(this.cfg);
        
        this.sendChannel = this.conn.createDataChannel('sendDataChannel', { reliable: true });
        this.sendChannel.onopen = this.onSendOpen;
        this.sendChannel.onmessage = this.onMessage;
        this.sendChannel.onclose = this.onSendclose;
        console.log(`Created ${this.name} send channel`);

        this.conn.onicecandidate = this.onicecandidate;
        this.conn.ondatachannel = this.onDataChannel;
        this.conn.onconnectionstatechange = ((ev) => console.log(ev))/
        console.log(`Created ${this.name} connection`);

    }

    async createOffer() {
        this.offer = await this.conn.createOffer();
        await this.conn.setLocalDescription(this.offer);
        console.log(`Offer for ${this.name}`, this.offer);
    }

    async join(code) {
        this.conn.setRemoteDescription(code);
        this.answer = await this.conn.createAnswer();
        await this.conn.setLocalDescription(this.answer);
        console.log(' aq');
        console.log(this.answer);
        console.log(this.sendChannel);
    }

    async acceptConn(code) {
        await this.conn.setRemoteDescription(code);
        
        console.log(' aq');
        console.log(this.offer);
        console.log(this.sendChannel);
    }

    onMessage(e) {
        console.log(`${this.name} onMessage`, e);
    }

    onIceCandidate(e) {
        console.log(`${this.name} onIceCandidate`);

    }

    onSendOpen() {
        console.log(`${this.name} onSendOpen`);
    }

    onSendclose() {
        console.log(`${this.name} onSendclose`);
    }

    onDataChannel() {
        console.log(`${this.name} onDatChanel`);
    }

    send(msg) {
        this.sendChannel.send(msg);
    }

}

let c;

document.getElementById("host").onclick = async function() {
    c = new Peer(document.getElementById("name").innerText, null);
    c.init();
    await c.createOffer();

    document.getElementById("hostOffer").innerText = JSON.stringify(c.offer);
}

document.getElementById("join").onclick = async function() {
    console.log(document.getElementById("joinCode"));
    const answer = JSON.parse(document.getElementById("joinCode").value);
    c = new Peer(document.getElementById("name").innerText, null);
    c.init();
    await c.join(answer);

    document.getElementById("joinAnswer").innerText = JSON.stringify(c.answer);
}

document.getElementById('accept').onclick = async function() {
    c.acceptConn(JSON.parse(document.getElementById("acceptCode").value));
}

document.getElementById('sendMsg').onclick = async function() {
    c.send(document.getElementById('myMsg').value);
}
