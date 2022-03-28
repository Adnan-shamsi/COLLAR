import socketio from "socket.io-client";

class Broadcast {
  constructor() {
    this.teamMember = [];
    this.socket = socketio.connect(process.env.REACT_APP_BASE_URL);
    this.controller = null;
    this.socket.once("syncIntialData", () => syncInitialData());
    this.socket.on("remoteChanges", (changes) => this.handleRemoteOperation(changes));
    this.socket.on("sendFullData", ({ id }) => sendFullData(id));
    this.socket.on("peopleInRoom", (data) => updateTeamMember(data));
  }

  joinRoom() {
    this.socket.emit(
      "join",
      {
        room: "public",
        username: "adnan",
      },
      ({ error, user }) => {
        if (error) return alert(error);
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
    this.socket.emit("MyFullData", {
      sendTo: id,
      crdt: this.controller.crdt,
      versionVector: this.controller.versionVector,
      senderSiteId: this.controller.siteId,
    });
  }

  syncInitialData(data){
    this.controller.populateCRDT(data.crdt);
  }
  
  handleRemoteOperation(data){
    this.controller.handleRemoteOperation(data);
  }

  updateTeamMember(data){
    if(data.userJoin){
      this.controller.addToNetwork(data.username, data.siteId);
    }else{
      this.controller.removeFromNetwork(data.username);
    }
  }
}
export default Broadcast;
