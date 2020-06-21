const { URI } = require('./config.js');
const MongoClient = require('mongodb').MongoClient;


class DoublyLinkedList {

  // DATABASE METHODS

  async init() {
    try {
      this.client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
      await this.client.connect();
      // console.log('Connected to MongoDB Atlas');
      this.collection = this.client.db('dev').collection('linked-list');

    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  async resetAtlasData() {
    try {
      await this.collection.deleteMany({ value: { $exists: true } });

    } catch (err) {
      console.log(err);
    }
  }

  async resetMeta() {
    try {
      await this.collection.updateOne(
        { meta: true },
        { $set: {
            head: null,
            tail: null,
            length: 0
          }
        },
        { upsert: true }
      );

    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  // DOUBLY LINKED LIST METHODS

  async createNewNode(value, next = null, prev = null) {
    // returns insertOneWriteOpResult object; doc found in ops property array
    return await this.collection.insertOne({ value, next, prev });
  }

  async getMeta() {
    // returns doc
    return await this.collection.findOne({ meta: true });
  }

  async setMeta(obj) {
    // returns findAndModifyWriteOpResult object; updated doc found in value property because returnOriginal is false
    return await this.collection.findOneAndUpdate(
      { meta: true },
      { $set: {
          head: obj.head,
          tail: obj.tail,
          length: obj.length
        }
      },
      { returnOriginal: false }
    );
  }

  async push(value) {
    try {
      const meta = await this.getMeta();

      if (!meta.head && !meta.tail) {
        const newNode = await this.createNewNode(value);
        meta.head = newNode.insertedId;
        meta.tail = newNode.insertedId;
      } else {
        const newNode = await this.createNewNode(value, null, meta.tail);
        await this.collection.findOneAndUpdate({ _id: meta.tail }, { $set: { next: newNode.insertedId } });
        meta.tail = newNode.insertedId;
      }

      // update meta doc
      meta.length++;
      const updatedMeta = await this.setMeta(meta);
      return updatedMeta.value.length;

    } catch (err) {
      console.log(err.message, err.stack);
    }
  }

  async pop() {
    try {
      const meta = await this.getMeta();

      // if nothing to pop, return undefined
      if (!meta.tail) return undefined;

      // delete the doc
      const popped = await this.collection.findOneAndDelete({ _id: meta.tail });

      // if head and tail are equal
      if (meta.head.toString() === meta.tail.toString()) {
        meta.head = null;
        meta.tail = null;
        meta.length = 0;

      // if head and tail are not equal
      } else {
        meta.tail = popped.value.prev;
        await this.collection.findOneAndUpdate({ _id: meta.tail }, { $set: { next: null } });
        meta.length--;
      }

      // update meta
      await this.setMeta(meta);
      // return popped value
      return popped.value.value;

    } catch (err) {
      console.log(err.message, err.stack);
    }
  }

  async shift() {
    try {
      const meta = await this.getMeta();

      // if no head, return undefined
      if (!meta.head) return undefined;

      // otherwise, delete head doc
      const shifted = await this.collection.findOneAndDelete({ _id: meta.head });

      // if head and tail are equal
      if (meta.head.toString() === meta.tail.toString()) {
        meta.head = null;
        meta.tail = null;
        meta.length = 0;

      // if head and tail are not equal
      } else {
        meta.head = shifted.value.next;
        await this.collection.findOneAndUpdate({ _id: meta.head }, { $set: { prev: null } });
        meta.length--;
      }

      // update meta
      await this.setMeta(meta);
      // return shifted value
      return shifted.value.value;

    } catch (err) {
      console.log(err.message, err.stack);
    }
  }

  async unshift(value) {
    try {
      const meta = await this.getMeta();

      // if no head
      if (!meta.head) {
        const newNode = await this.createNewNode(value);
        meta.head = newNode.insertedId;
        meta.tail = newNode.insertedId;

      // if head exists
      } else {
        const newNode = await this.createNewNode(value, meta.head, null);
        await this.collection.findOneAndUpdate({ _id: meta.head }, { $set: { prev: newNode.insertedId } });
        meta.head = newNode.insertedId;
      }

      // update meta
      meta.length++;
      const updatedMeta = await this.setMeta(meta);
      // return new length
      return updatedMeta.value.length;

    } catch (err) {
      console.log(err.message, err.stack);
    }
  }

  async get(index, nodeWanted = true) {
    try {
      const meta = await this.getMeta();

      if (index < 0 || index > meta.length - 1) return undefined;

      let counter;
      let pointer;

      // start from head
      if (index <= meta.length / 2) {
        counter = 0;
        pointer = await this.collection.findOne({ _id: meta.head });
        while (counter !== index) {
          counter++;
          pointer = await this.collection.findOne({ _id: pointer.next });
        }

      // start from tail
      } else {
        counter = meta.length - 1;
        pointer = await this.collection.findOne({ _id: meta.tail });
        while (counter !== index) {
          counter--;
          pointer = await this.collection.findOne({ _id: pointer.prev });
        }
      }

      // return pointer or value
      return nodeWanted ? pointer : pointer.value;

    } catch (err) {
      console.log(err.message, err.stack);
    }
  }

}

if (false) {
  (async function() {
    try {
      const linkedList = new DoublyLinkedList();
      await linkedList.init();
      await linkedList.resetAtlasData();
      await linkedList.resetMeta();

      // experiment with methods here

      // push
      await linkedList.push(10);
      await linkedList.push(20);
      await linkedList.push(30);
      await linkedList.push(40);
      await linkedList.push(50);

      // get
      console.log(await linkedList.get(4));

      console.log('Done');






    } catch (err) {
      console.error(err.message, err.stack);
    }
  })();
}

module.exports = DoublyLinkedList;