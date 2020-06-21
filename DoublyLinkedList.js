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

}

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

    console.log('Done');






  } catch (err) {
    console.error(err.message, err.stack);
  }
})();

module.exports = DoublyLinkedList;