const { URI } = require('./config.js');
const MongoClient = require('mongodb').MongoClient;


class LinkedList {

  // DATABASE METHODS

  async init() {
    this.client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await this.client.connect();
      console.log('Connected to MongoDB Atlas');
      this.collection = this.client.db('dev').collection('linked-list');
    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  async resetAtlasData() {
    await this.collection.deleteMany({ value: { $exists: true } });
  }

  async resetMeta() {
    try {
      await this.collection.updateOne(
        { meta: true },
        { $set: {
            head: null,
            tail: null
          }
        },
        { upsert: true }
      );
    } catch (err) {
      console.error(err.message, err.stack);
    }
  }


  // LINKED LIST METHODS

  async createNewNode(value) {
    return await this.collection.insertOne({ value, next: null });
  }

  async getMeta() {
    return await this.collection.findOne({ meta: true });
  }

  async setMeta(obj) {
    if (obj.head && obj.tail) {
      return await this.collection.findOneAndUpdate(
        { meta: true },
        { $set: {
            head: obj.head,
            tail: obj.tail
          }
        },
        { returnOriginal: false }
      );
    } else if (obj.head) {
      return await this.collection.findOneAndUpdate(
        { meta: true },
        { $set: {
            head: obj.head
          }
        },
        { returnOriginal: false }
      );
    } else {
      return await this.collection.findOneAndUpdate(
        { meta: true },
        { $set: {
            tail: obj.tail
          }
        },
        { returnOriginal: false }
      );
    }
  }

  async push(value) {
    try {
      const newNode = await this.createNewNode(value);
      const meta = await this.getMeta();

      if (!meta.head && !meta.tail) {
        meta.head = newNode.insertedId;
        meta.tail = newNode.insertedId;

      } else {
        // update current tail.next with newNode.insertedId
        await this.collection.findOneAndUpdate({ _id: meta.tail }, { $set: { next: newNode.insertedId } });
        meta.tail = newNode.insertedId;
      }

      // update meta doc
      this.setMeta(meta);

    } catch (err) {
      console.error(err.message, err.stack);
    }
  }
}


(async function() {
  try {
    const linkedList = new LinkedList();
    await linkedList.init();
    await linkedList.resetAtlasData();
    await linkedList.resetMeta();
    await linkedList.push('Cat');
    await linkedList.push('Dog');
  } catch (err) {
    console.error(err.message, err.stack);
  }
})();