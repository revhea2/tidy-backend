class Node {
  constructor(weight, progress, name) {
    this.progress = progress;
    this.name = name;
    this.weight = weight;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
  }

}


module.exports = Node