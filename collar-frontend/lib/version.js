class Version {
  constructor(siteId) {
    this.siteId = siteId;
    this.counter = 0;
  }

  update(version) {
    const incomingCounter = version.counter;

    if (incomingCounter <= this.counter) {
      console.log("Duplicate opeations");
    } else if (incomingCounter === this.counter + 1) {
      this.counter = this.counter + 1;
    } else {
      this.counter = incomingCounter;
    }
  }
}

export default Version;
