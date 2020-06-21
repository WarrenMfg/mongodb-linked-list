const { URI } = require('./config.js');
const MongoClient = require('mongodb').MongoClient;


class DoublyLinkedList {

  // DATABASE METHODS

  async init() {
    try {
      this.client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
      await this.client.connect();
      console.log('Connected to MongoDB Atlas');
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

  async createNewNode(value, next = null) {
    // returns insertOneWriteOpResult object; doc found in ops property array
    return await this.collection.insertOne({ value, next });
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

}

(async function() {
  try {
    const linkedList = new DoublyLinkedList();
    await linkedList.init();
    await linkedList.resetAtlasData();
    await linkedList.resetMeta();

    // experiment with methods here
    console.log('Ready');

    // push

  } catch (err) {
    console.error(err.message, err.stack);
  }
})();

module.exports = DoublyLinkedList;