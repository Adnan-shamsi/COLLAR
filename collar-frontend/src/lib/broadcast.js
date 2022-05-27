import socketio from "socket.io-client";

class Broadcast {
  constructor() {
    this.teamMember = [];
    this.socket = socketio.connect(
      process.env.BASE_URL || "http://localhost:8080/"
    );

    this.controller = null;
    this.socket.once("syncIntialData", (data) => this.syncInitialData(data));
    this.socket.on("RemoteChanges", (changes) =>
      this.handleRemoteOperation(changes)
    );
    //send full data to server then server will send to that particular id
    this.socket.on("sendFullData", ({ id }) => this.sendFullData(id));
    this.socket.on("peopleInRoom", (data) => this.updateTeamMember(data));
    this.socket.on("compileResult", (data) => this.notifyCompileResult(data));
  }
  
  codeCompilation(data){
    this.socket.emit('codeCompile',data)
  }
  
  notifyCompileResult(data){
    alert(data.output);
  }

  joinRoom(username, room) {
    this.socket.emit(
      "join",
      {
        room,
        username,
      },
      ({ error, user }) => {
        if (error) return alert(error);
        console.log(user);
      }
    );
  }

  send(operation) {
    if (operation.type === "insert" || operation.type === "delete") {
      return this.socket.emit("LocalChanges", operation);
    }
    return console.log("some unknown send request");
  }

  sendFullData(id) {
    if (this.controller.crdt.isEmpty()) return;
    let data = {
      sendTo: id,
      crdt: this.controller.crdt.struct,
      versionVector: this.controller.vector.versions,
      senderSiteId: this.controller.siteId,
    };
    //data = JSON.parse(JSON.stringify(data))
    this.socket.emit("MyFullData", data);
    console.log("done");
  }

  syncInitialData(data) {
    this.controller.populateCRDT(data.crdt);
    this.controller.populateVersionVector(data.versionVector);
  }

  handleRemoteOperation(data) {
    this.controller.handleRemoteOperation(data);
  }

  updateTeamMember(data) {
    console.log("updateTeamMember", data);
    if (data.userJoin) {
      this.controller.addToNetwork(data.username, data.siteId);
    } else {
      this.controller.removeFromNetwork(data.username);
    }
  }
}
export default Broadcast;
