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

  async push(value) {
    try {
      const newNode = await this.createNewNode(value);
      const meta = await this.getMeta();

      // if no head or tail
      if (!meta.head && !meta.tail) {
        // head and tail are equal
        meta.head = newNode.insertedId;
        meta.tail = newNode.insertedId;

      } else {
        // otherwise, update current tail.next with newNode.insertedId
        await this.collection.findOneAndUpdate({ _id: meta.tail }, { $set: { next: newNode.insertedId } });
        // make newNode the tail
        meta.tail = newNode.insertedId;
      }

      // update meta doc
      meta.length++;
      const updatedMeta = await this.setMeta(meta);
      return updatedMeta.value.length;

    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  async pop() {
    try {
      const meta = await this.getMeta();

      // if nothing to pop, return undefined
      if (!meta.tail) return undefined;

      // if head and tail are equal
      if (meta.head.toString() === meta.tail.toString()) {
        // delete single doc
        const popped = await this.collection.findOneAndDelete({ _id: meta.head });
        // update meta
        meta.head = null;
        meta.tail = null;
        meta.length = 0;
        await this.setMeta(meta);
        return popped.value.value;
      }

      // if head and tail are not equal, iterate through linked list
      let pre = await this.collection.findOne({ _id: meta.head });
      let lead = pre;
      while (lead.next) {
        pre = lead;
        lead = await this.collection.findOne({ _id: lead.next });
      }
      // delete lead doc
      const popped = await this.collection.findOneAndDelete({ _id: lead._id });
      // update pre.next to be null
      await this.collection.findOneAndUpdate({ _id: pre._id }, { $set: { next: null }});
      // update meta
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

      // if no head, return undefined
      if (!meta.head) return undefined;

      // otherwise, delete head doc
      const shifted = await this.collection.findOneAndDelete({ _id: meta.head });

      // if head and tail are equal
      if (meta.head.toString() === meta.tail.toString()) {
        // update meta
        meta.head = null;
        meta.tail = null;
        meta.length = 0;
        await this.setMeta(meta);
        return shifted.value.value;
      }

      // otherwise, if head and tail are not equal, update meta
      meta.head = shifted.value.next;
      meta.length--;
      await this.setMeta(meta);
      return shifted.value.value;

    } catch (err) {
      console.error(err.message, err.stack);
    }
  }

  async unshift(value) {
    try {
      const meta = await this.getMeta();

      // if no head
      if (!meta.head) {
        // create node
        const newNode = await this.createNewNode(value);
        // make head and tail new node _id
        meta.head = newNode.insertedId;
        meta.tail = newNode.insertedId;

      // else head exists
      } else {
        // create node with value and meta.head as next
        const newNode = await this.createNewNode(value, meta.head);
        // make meta.head new node _id
        meta.head = newNode.insertedId;
      }

      // increment length
      meta.length++;
      // setMeta
      const updatedMeta = await this.setMeta(meta);
      // return length
      return updatedMeta.value.length;

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
    // await linkedList.push('Cat');
    // await linkedList.push('Dog');
    // await linkedList.push('Rooster');
    // pop
    // await linkedList.shift();
    // await linkedList.shift();
    // await linkedList.shift();
    // unshift
    await linkedList.unshift('Rabbit');
    await linkedList.unshift('Groundhog');
    await linkedList.unshift('Bird');

  } catch (err) {
    console.error(err.message, err.stack);
  }
})();