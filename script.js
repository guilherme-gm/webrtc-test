class Host {
    constructor(name, server, type) {// host , guest
        this.name = name;
        this.server = server;
    }

    init = async () => {
        this.conn = new RTCPeerConnection({ urls: "stun:stun.l.google.com:19302" });
        this.conn.oniceconnectionstatechange = this.onIceConnectionStateChange;
        this.conn.onicecandidate = this.onIceCandidate;
        
        this.dc = this.conn.createDataChannel('chat', { reliable: true });
        this.dc.onopen = this.onChannelOpen;
        this.dc.onmessage = this.onMessage;

        // this offer is not the one used by the other client,
        // we have to wait for the ICE Candidate
        const offer = await this.conn.createOffer();
        await this.conn.setLocalDescription(offer);
    }

    acceptConn = async (code) => {
        const answer = new RTCSessionDescription(code);
        await this.conn.setRemoteDescription(answer);
        
        console.log('acceptConn complete');
    }
/*
    onMessage = (e) => {
        console.log(`${this.name} onMessage`, e);
    }
*/
    onIceCandidate = (e) => {
        console.log('onicecandidate', e);
        if (e.candidate) return;
        document.getElementById("hostOffer").innerText = JSON.stringify(this.conn.localDescription);
    }

    onIceConnectionStateChange = (e) => {
        console.log('on iec connection state change', e)
        var state = this.conn.iceConnectionState;
        console.log(state);
        // $('#status').html(state);
        if (state == "connected") {
            console.log('good to send')
        };
    }

    onChannelOpen = () => {
        console.log('onChannelOpen');
    }

    onMessage = (e) => {
        console.log(e);
    }
    
    send = (msg) => {
        this.dc.send(msg);
    }

}

var sdpConstraints = { optional: [{RtpDataChannels: true}]  };

class Guest {
    constructor(name, server, type) {// host , guest
        this.name = name;
        this.server = server;
        this.type = type;
    }

    init = () => {
        const conn = new RTCPeerConnection({ urls: "stun:stun.l.google.com:19302" })
        conn.ondatachannel = (e) => { console.log('on data channel'); this.onDataChannel(e) };
        conn.onicecandidate = this.onIceCandidate;
        conn.oniceconnectionstatechange = (e) => { console.log('aaaa'); this.onIceConnectionStateChange(e) };
        this.conn = conn;
        
        console.log(`Created ${this.name} connection`);
    }

    onIceCandidate = (e) => {
        console.log('on ice candidate', e);
        if (e.candidate) return;
        document.getElementById("joinAnswer").innerText = JSON.stringify(this.conn.localDescription);
    }

    onIceConnectionStateChange = (e) => {
        console.log('onIceConnectionStateChange', e);
        var state = this.conn.iceConnectionState
        console.log(state);
        if (state == "connected") console.log('good to msg');
    }

    onDataChannel = (e) => {
        console.log(`${this.name} onDatChanel`, e);
        this.data = e.channel;
        this.data.onopen    = () => console.log('connected');
        this.data.onmessage = (e) => { if (e.data) console.log(e.data); }
    }

    join = async (code) => {
        const offerDesc = new RTCSessionDescription(code);
        this.conn.setRemoteDescription(offerDesc);
        this.answer = await this.conn.createAnswer(sdpConstraints);
        await this.conn.setLocalDescription(this.answer);
        console.log("join complete");
    }

    send = (msg) => {
        this.data.send(msg);
    }

}

let c;

document.getElementById("host").onclick = async function() {
    c = new Host(document.getElementById("name").innerText, null, 'host');
    await c.init();
}

document.getElementById("join").onclick = async function() {
    const offerCode = JSON.parse(document.getElementById("joinCode").value);
    c = new Guest(document.getElementById("name").innerText, null, 'guest');
    await c.init();
    await c.join(offerCode);
}

document.getElementById('accept').onclick = async function() {
    c.acceptConn(JSON.parse(document.getElementById("acceptCode").value));
}

document.getElementById('sendMsg').onclick = async function() {
    c.send(document.getElementById('myMsg').value);
}
