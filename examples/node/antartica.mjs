import fetch from 'node-fetch';
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';
import util from 'util';

const rl = readline.createInterface({ input, output });
const question = util.promisify(rl.question).bind(rl); // promise API still experimental so...

// A simple example that shows how to create a new record for the latn number system
// and en-AQ locale. Creates new record, modifies it, and cleans up by deleting it.
class AntarticaExample {

  accessToken; // holds the jwt access token after login
  template; // holds the en latn number system data
  copy; // a copy we modify for en-AQ [English (Antartica)]
  id; // stores the id of the en-AQ record after creation

  run = async () => {
    try {
      console.log('You need an access token for admin operations. Please enter your credentials.')
      this.accessToken = await this.getAccessToken().catch(e => {throw e});
      console.log(`Access token: ${this.accessToken}`);
      console.log('Getting the en latn number system data to use as a template.');
      this.template = await this.getEnNumbersLatnTemplate().catch(e => {throw e});
      console.log('Template downloaded:');
      console.log(JSON.stringify(this.template, null, 2));
      console.log('Creating a copy of the template data.');
      this.copy = Object.assign({}, this.template);
      console.log('Updating tag and adding territory information on the template copy.');
      this.copy.tag = 'en-AQ';
      this.copy.identity.territory = 'AQ';
      console.log('Deleting the _id property on the copy.')
      delete this.copy._id;
      console.log(`This is the payload we are going to post:\n${JSON.stringify(this.copy, null, 2)}`);
      console.log('Posting the new data to /admin/numbers.');
      this.id = await this.postEnAQData().catch(e => {throw e});
      console.log(`Here is the id of the newly created record: ${this.id}`);
      const update = {
        main: {
          displayName: 'Frozen Digits'
        }
      };
      console.log(`Here is the update we are going to patch onto this record:\n${JSON.stringify(update, null, 2)}`);
      console.log('Patching record.');
      const updated = await this.updateAndGetEnAQNumbersLatnData(update);
      console.log(`Here is the updated record:\n${JSON.stringify(updated, null, 2)}`);
      console.log(`Clean up by deleting record ${this.id}.`);
      await this.deleteEnQaNumbersLatnData();
      console.log('Record deleted.');
    } catch(e) {
      console.error(e);
    }
  }


  getAccessToken = async () => {
    const email = await question('Email: ');
    const password = await question('Password: ');
    rl.close();
  
    const options = {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        password: password
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    }
  
    const response = await fetch('http://localhost:3000/auth', options).catch(e => {throw e});
    const jwt = await response.json();
    return jwt.accessToken;
  }

  getEnNumbersLatnTemplate = async () => {
    const response = await fetch('http://localhost:3000/public/numbers/latn?locales=en').catch(e => {throw e});
    const data = await response.json();
    return data.numberSystems[0];
  }

  postEnAQData = async() => {
    const options = {
      method: 'POST',
      body: JSON.stringify(this.copy),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      }
    }
    const response = await fetch('http://localhost:3000/admin/numbers', options);
    const newData = await response.json();
    return newData._id;
  }

  updateAndGetEnAQNumbersLatnData = async (update) => {
    const options = {
      method: 'PATCH',
      body: JSON.stringify(update),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      }
    };
  
    await fetch(`http://localhost:3000/admin/numbers/${this.id}`, options);
    const response = await fetch(`http://localhost:3000/admin/numbers/${this.id}`, {method: 'GET', headers: {'Authorization': `Bearer ${this.accessToken}`}});
    const newData = await response.json();
    return newData;
  }
  
  deleteEnQaNumbersLatnData = async (id, accessToken) => {
    return await fetch(`http://localhost:3000/admin/numbers/${this.id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${this.accessToken}`}});
  }
  
}

const example = new AntarticaExample();
example.run();