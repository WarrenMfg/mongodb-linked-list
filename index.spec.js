const LinkedList = require('./index');
const { expect } = require('chai');

describe('Singly Linked List', () => {
  let list;
  let length;
  let meta;
  let head;
  let tail;
  let areEqual;

  beforeEach(async () => {
    try {
      linkedList = new LinkedList();
      await linkedList.init();
      await linkedList.resetAtlasData();
      await linkedList.resetMeta();

    } catch (err) {
      console.log(err);
    }
  });

  afterEach(async () => {
    try {
      await linkedList.client.close();

    } catch (err) {
      console.log(err);
    }
  });

  xdescribe('Constructor', () => {
    it('LinkedList constructor returns a new instance', () => {
      expect(linkedList).to.be.an.instanceOf(LinkedList);
    });
  });

  xdescribe('Push', () => {
    it('Pushes a new node into empty list', async () => {
      try {
        length = await linkedList.push(10);
        meta = await linkedList.getMeta();
        head = await linkedList.collection.findOne({ _id: meta.head });

        expect(length).to.equal(1);
        expect(meta.length).to.equal(1);
        expect(head.value).to.equal(10);
        expect(head.next).to.be.null;
        expect(meta.head.toString()).to.equal(head._id.toString());
        areEqual = meta.head.toString() === meta.tail.toString();
        expect(areEqual).to.be.true;

      } catch (err) {
        console.log(err);
      }
    });

    it('Pushes a new node into nonempty list', async () => {
      try {
        await linkedList.push(10);
        length = await linkedList.push(20);
        meta = await linkedList.getMeta();
        head = await linkedList.collection.findOne({ _id: meta.head });
        tail = await linkedList.collection.findOne({ _id: meta.tail });

        expect(length).to.equal(2);
        expect(meta.length).to.equal(2);
        expect(head.value).to.equal(10);
        expect(tail.value).to.equal(20);
        areEqual = meta.head.toString() === head._id.toString();
        expect(areEqual).to.be.true;
        areEqual = meta.tail.toString() === tail._id.toString();
        expect(areEqual).to.be.true;
        areEqual = meta.head.toString() === meta.tail.toString();
        expect(areEqual).to.be.false;
      } catch (err) {
        console.log(err);
      }
    });
  });

  xdescribe('Pop', () => {
    it('Returns undefined for an empty list', async () => {
      try {
        const popped = await linkedList.pop();
        expect(popped).to.be.undefined;
      } catch (err) {
        console.log(err);
      }
    });

    it('Returns popped value of a one item list and resets instance to empty list', async () => {
      try {
        await linkedList.push(10);
        const popped = await linkedList.pop();
        expect(popped).to.equal(10);
        meta = await linkedList.getMeta();
        expect(meta.head).to.be.null;
        expect(meta.tail).to.be.null;
        expect(meta.length).to.equal(0);
      } catch (err) {
        console.log(err);
      }
    });

    it('Iterates through a list of items and returns the last value', async () => {
      try {
        await pushItems(linkedList);
        meta = await linkedList.getMeta();
        expect(meta.length).to.equal(5);
        head = await linkedList.collection.findOne({ _id: meta.head });
        expect(head.value).to.equal(10);
        tail = await linkedList.collection.findOne({ _id: meta.tail });
        expect(tail.value).to.equal(50);
        const popped = await linkedList.pop();
        expect(popped).to.equal(50);
        meta = await linkedList.getMeta();
        expect(meta.length).to.equal(4);
        head = await linkedList.collection.findOne({ _id: meta.head });
        expect(head.value).to.equal(10);
        tail = await linkedList.collection.findOne({ _id: meta.tail });
        expect(tail.value).to.equal(40);

      } catch (err) {
        console.log(err);
      }
    });
  });

  xdescribe('Shift', () => {
    it('Returns undefined for an empty list', async () => {
      try {
        const shifted = await linkedList.shift();
        expect(shifted).to.be.undefined;

      } catch (err) {
        console.log(err);
      }
    });

    it('Returns value of a one item list and resets instance to empty list', async () => {
      await linkedList.push(10);
      const shifted = await linkedList.shift();
      expect(shifted).to.equal(10);
      meta = await linkedList.getMeta();
      expect(meta.head).to.be.null;
      expect(meta.tail).to.be.null;
      expect(meta.length).to.equal(0);
    });

    it('Returns value of a multi-item list and reassigns head to next item', async () => {
      try {
        await pushItems(linkedList);
        meta = await linkedList.getMeta();
        head = await linkedList.collection.findOne({ _id: meta.head });
        tail = await linkedList.collection.findOne({ _id: meta.tail });
        expect(meta.length).to.equal(5);
        expect(head.value).to.equal(10);
        expect(tail.value).to.equal(50);
        const shifted = await linkedList.shift();
        expect(shifted).to.equal(10);
        meta = await linkedList.getMeta();
        head = await linkedList.collection.findOne({ _id: meta.head });
        tail = await linkedList.collection.findOne({ _id: meta.tail });
        expect(meta.length).to.equal(4);
        expect(head.value).to.equal(20);
        expect(tail.value).to.equal(50);

      } catch (err) {
        console.log(err);
      }
    });
  });

  xdescribe('Unshift', () => {
    it('Unshifts a new node into empty list', async () => {
      try {
        length = await linkedList.unshift(10);
        meta = await linkedList.getMeta();
        head = await linkedList.collection.findOne({ _id: meta.head });
        tail = await linkedList.collection.findOne({ _id: meta.tail });
        expect(length).to.equal(1);
        expect(meta.length).to.equal(1);
        expect(head.value).to.equal(10);
        expect(tail.value).to.equal(10);
        areEqual = meta.head.toString() === meta.tail.toString();
        expect(areEqual).to.be.true;

      } catch (err) {
        console.log(err);
      }
    });

    it('Unshifts a new node into nonempty list', async () => {
      try {
        await linkedList.unshift(10);
        length = await linkedList.unshift(20);
        meta = await linkedList.getMeta();
        head = await linkedList.collection.findOne({ _id: meta.head });
        tail = await linkedList.collection.findOne({ _id: meta.tail });
        expect(length).to.equal(2);
        expect(meta.length).to.equal(2);
        expect(head.value).to.equal(20);
        expect(tail.value).to.equal(10);
        areEqual = meta.head.toString() === meta.tail.toString();
        expect(areEqual).to.be.false;

      } catch (err) {
        console.log(err);
      }
    });
  });

  xdescribe('Get', () => {
    it('Returns undefined for indices outside its scope', async () => {
      try {
        expect(await linkedList.get(-1)).to.be.undefined;
        expect(await linkedList.get(0)).to.be.undefined;
        expect(await linkedList.get(1)).to.be.undefined;
        await linkedList.push(10);
        expect(await linkedList.get(-1)).to.be.undefined;
        expect(await linkedList.get(1)).to.be.undefined;

      } catch (err) {
        console.log(err);
      }
    });

    it('Returns the value for indices inside its scope', async () => {
      try {
        await pushItems(linkedList);
        meta = await linkedList.getMeta();
        for (let i = 0; i < meta.length; i++) {
          expect(await linkedList.get(i, false)).to.equal((i + 1) * 10);
        }

      } catch (err) {
        console.log(err);
      }
    });
  });

  xdescribe('Set', () => {
    it('Returns false for indices outside its scope', async () => {
      try {
        expect(await linkedList.set(-1)).to.be.false;
        expect(await linkedList.set(0)).to.be.false;
        expect(await linkedList.set(1)).to.be.false;
        await linkedList.push(10);
        expect(await linkedList.set(-1)).to.be.false;
        expect(await linkedList.set(1)).to.be.false;

      } catch (err) {
        console.log(err);
      }
    });

    it ('Sets items and returns true for indices inside its scope', async () => {
      try {
        await pushItems(linkedList);
        meta = await linkedList.getMeta();
        for (let i = 0; i < meta.length; i++) {
          expect(await linkedList.set(i, i)).to.be.true;
        }
        for (let i = 0; i < meta.length; i++) {
          expect(await linkedList.get(i, false)).to.equal(i);
        }

      } catch (err) {
        console.log(err);
      }
    });
  });

  describe('Insert', () => {
    it('Returns undefined for indices outside its scope', async () => {
      try {
        expect(await linkedList.insert(-1)).to.be.undefined;
        expect(await linkedList.insert(1)).to.be.undefined;
        await linkedList.push(10);
        expect(await linkedList.insert(-1)).to.be.undefined;
        expect(await linkedList.insert(2)).to.be.undefined;

      } catch (err) {
        console.log(err);
      }
    });

    it('Returns length when index === 0 and index === this.length', async () => {
      try {
        length = await linkedList.insert(0, 10);
        expect(length).to.equal(1);
        length = await linkedList.insert(1, 20);
        expect(length).to.equal(2);

      } catch (err) {
        console.log(err);
      }
    });

    it('Returns length when inserting in the middle of the list', async () => {
      try {
        await pushItems(linkedList);
        length = await linkedList.insert(2, 200);
        expect(length).to.equal(6);

        for (let i = 0; i < length; i++) {
          const value = await linkedList.get(i, false);
          if (i < 2) expect(value).to.equal((i + 1) * 10);
          else if (i === 2) expect(value).to.equal(200);
          else expect(value).to.equal(i * 10);
        }

      } catch (err) {
        console.log(err);
      }
    });
  });

  xdescribe('Remove', () => {
    it('Returns undefined for indices outside its scope', () => {
      expect(list.remove(-1)).to.be.undefined;
      expect(list.remove(2)).to.be.undefined;
      list.push(10);
      expect(list.remove(-1)).to.be.undefined;
      expect(list.remove(2)).to.be.undefined;
    });

    it('Returns a node\'s value when removed from the beginning and end of the list', () => {
      pushItems(list);
      expect(list.length).to.equal(5);
      expect(list.remove(0)).to.equal(10);
      expect(list.length).to.equal(4);
      expect(list.remove(list.length - 1)).to.equal(50);
      expect(list.length).to.equal(3);
    });

    it('Returns a node\'s value when removed from the middle of the list', () => {
      pushItems(list);
      expect(list.length).to.equal(5);
      expect(list.remove(2)).to.equal(30);
      expect(list.length).to.equal(4);
      expect(list.remove(2)).to.equal(40);
      expect(list.length).to.equal(3);
      for (let i = 0; i < list.length; i++) {
        const remaining = [10, 20, 50];
        expect(list.get(i, false)).to.equal(remaining[i]);
      }
    });
  });

  xdescribe('Reverse', () => {
    it('Returns null on an empty list', () => {
      expect(list.reverse()).to.be.null;
    });

    it('Returns the same node on a list of length 1', () => {
      list.push(10);
      expect(list.head).to.equal(list.tail);
      list.reverse();
      expect(list.head).to.equal(list.tail);
    });

    it('Reverses a list and returns the new head/old tail', () => {
      pushItems(list);
      const oldHead = list.get(0);
      const oldTail = list.get(list.length - 1);
      const newHead = list.reverse();
      expect(newHead).to.equal(oldTail);
      expect(list.head).to.equal(oldTail);
      expect(list.tail).to.equal(oldHead);
      for (let i = 0; i < list.length; i++) {
        const newOrder = [50,40,30,20,10];
        expect(list.get(i, false)).to.equal(newOrder[i]);
      }
    });
  });
});

async function pushItems(list) {
  // push 5 items
  for (let i = 10; i <= 50; i += 10) {
    await list.push(i);
  }
}