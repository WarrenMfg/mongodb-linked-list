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
}

module.exports = DoublyLinkedList;