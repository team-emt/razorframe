const LinkedList = require('../../lib/LinkedList');
const { expect } = require('chai');

describe('messaging queue unit tests', () => {

  describe('Linked List tests', () => {
    let ll = new LinkedList();

    it('Linked List should contain valid push / pop methods', () => {
      ll.push(5);
      ll.push(10);
      expect(ll.pop()).to.equal(5);
      expect(ll.pop()).to.equal(10);
    });

    it('Linked List assigns head properly', () => {
      ll.push(5);
      ll.push(10);
      expect(ll.head.value).to.equal(5);
    });

    it('Linked List assigns tail properly', () => {
      expect(ll.tail.value).to.equal(10);
    });
  });
});

