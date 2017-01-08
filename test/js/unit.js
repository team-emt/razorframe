const LinkedList = require('../../lib/LinkedList');
const { rz } = require('../../lib/Razorframe');
const { expect } = require('chai');

module.exports = new Promise(function(resolve, reject) {
  describe('messaging queue unit tests', function () {

    describe('#Linked List tests', function () {
      let ll = new LinkedList();

      it('Linked List should contain valid push / pop methods', function () {
        ll.push(5);
        ll.push(10);
        expect(ll.pop()).to.equal(5);
        expect(ll.pop()).to.equal(10);
      });

      it('Linked List assigns head properly', function () {
        ll.push(5);
        ll.push(10);
        expect(ll.head.value).to.equal(5);
      });

      it('Linked List assigns tail properly', function () {
        expect(ll.tail.value).to.equal(10);
      });
    });

    describe('#Messaging queue tests', function () {

      it('Razorframe should be instantiated', function () {
        expect(rz.razorframe).to.not.equal(undefined);
      });

      it('Should be empty', function () {
        expect(rz.razorframe.storage.length).to.equal(0);
      });

      it('should enqueue and dequeue messages', function () {
        let obj1 = { contents: 'test1', eventOut: 'test', action: 'write' };
        let obj2 = { contents: 'test2', eventOut: 'test', action: 'write' };
        rz.razorframe.enqueue(obj1);
        expect(rz.razorframe.storage.length).to.equal(1);
        rz.razorframe.enqueue(obj2);
        expect(rz.razorframe.storage.length).to.equal(2);
        expect(rz.razorframe.storage.pop()).to.equal(obj1);
        expect(rz.razorframe.storage.length).to.equal(1);
        expect(rz.razorframe.storage.pop()).to.equal(obj2);
        expect(rz.razorframe.storage.length).to.equal(0);
      });
    });

    describe('#Testing EventEmitter communication for function chains', function () {
      it('Enqueue should emit an enq event', function (done) {
        let obj1 = { contents: 'test1', eventOut: 'test', action: 'write' };
        rz.razorframe.notification.on('enq', function (data) {
          expect(data).to.equal(1);
          done();
        });
        rz.razorframe.enqueue(obj1);
      });

      it('Dequeue should emit a deq event', function (done) {
        rz.razorframe.notification.on('deq', function (data) {
          expect(data.contents).to.equal('test1');
          done();
        });
        rz.razorframe.dequeue();
        resolve();
      });
    });

  });
});
