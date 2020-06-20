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


  // LINKED LIST METHODS

  async createNewNode(value) {
    return await this.collection.insertOne({ value, next: null });
  }

  async getMeta() {
    return await this.collection.findOne({ meta: true });
  }

  async setMeta(obj) {
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
      meta.length++;
      const updatedMeta = await this.setMeta(meta);
      return updatedMeta.length;


    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  async pop() {
    try {
      const meta = await this.getMeta();
      if (!meta.tail) return undefined;

      // if head and tail are equal
      if (meta.head.toString() === meta.tail.toString()) {
        const popped = await this.collection.findOneAndDelete({ _id: meta.head });
        meta.head = null;
        meta.tail = null;
        meta.length = 0;
        await this.setMeta(meta);
        return popped.value.value;
      }

      // if head and tail are not equal
      let pre = await this.collection.findOne({ _id: meta.head });
      let lead = pre;
      while (lead.next) {
        pre = lead;
        lead = await this.collection.findOne({ _id: lead.next });
      }
      // pop lead
      const popped = await this.collection.findOneAndDelete({ _id: lead._id });
      // update pre.next to be null
      await this.collection.findOneAndUpdate({ _id: pre._id }, { $set: { next: null }})
      meta.tail = pre._id;
      meta.length--;
      await this.setMeta(meta);
      return popped.value.value;

    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  async shift() {
    try {
      const meta = await this.getMeta();
      if (!meta.head) return undefined;

      const shifted = await this.collection.findOneAndDelete({ _id: meta.head });

      // if head and tail are equal
      if (meta.head.toString() === meta.tail.toString()) {
        meta.head = null;
        meta.tail = null;
        meta.length = 0;
        await this.setMeta(meta);
        return shifted.value.value;
      }

      // if head and tail are not equal
      meta.head = shifted.value.next;
      meta.length--;
      await this.setMeta(meta);
      return shifted.value.value;

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
    // push
    await linkedList.push('Cat');
    await linkedList.push('Dog');
    await linkedList.push('Rooster');
    // pop
    await linkedList.shift();
    await linkedList.shift();
    await linkedList.shift();

  } catch (err) {
    console.error(err.message, err.stack);
  }
})();