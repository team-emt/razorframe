function LinkedList() { 
  this.head = null;
  this.tail = null;
  this.length = 0;
}

function Node(val) {
  this.value = val;
  this.next = null;
}

// adds node to end of list
LinkedList.prototype.push = function(value) {
  let newNode = new Node(value);
  if (!this.head) this.head = this.tail = newNode;
  else {
    this.tail.next = newNode; 
    this.tail = newNode;
  }

  this.length++;
  return true;
};

// remove node at beginning of list
LinkedList.prototype.pop = function() {
  if (!this.head) {
    console.error('No node to remove');
    return false;
  }
  const current = this.head.value;
  this.head = this.head.next;
  if (this.length === 1) this.tail = null;
  this.length--;
  return current;

};

module.exports = LinkedList;
