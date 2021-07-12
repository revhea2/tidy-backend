class Node {
  constructor(weight) {
    this.weight = weight;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
  }

}


module.exports = Node