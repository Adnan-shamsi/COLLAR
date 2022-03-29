import socketio from "socket.io-client";

class Broadcast {
  constructor() {
    this.teamMember = [];
    this.socket = socketio.connect(
      process.env.BASE_URL || "http://localhost:8080/"
    );

    this.controller = null;
    this.socket.once("syncIntialData", () => this.syncInitialData());
    this.socket.on("RemoteChanges", (changes) =>
      this.handleRemoteOperation(changes)
    );
    //send full data to server then server will send to that particular id
    this.socket.on("sendFullData", ({ id }) => this.sendFullData(id));  
    this.socket.on("peopleInRoom", (data) => this.updateTeamMember(data));
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
    this.socket.emit("MyFullData", {
      sendTo: id,
      crdt: this.controller.crdt,
      versionVector: this.controller.versionVector,
      senderSiteId: this.controller.siteId,
    });
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
