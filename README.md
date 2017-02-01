# sqs-utils

Build Amazon SQS-based applications without the boilerplate. 
SQSUtils provides you with everything you need to poll and send messages to Amazon AWS.

## Installation

```bash
npm install sqs-utils
```

## Usage

Create a new `SQSUtils` instance and tell it which SQS queue to use:

```js
const SQSUtils = require('sqs-utils');

const queue = new SQSUtils({
  queueUrl: 'https://sqs.eu-west-1.amazonaws.com/account-id/queue-name'
});
```

### Credentials

By default the library will look for AWS credentials in the places [specified by the AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials). The simplest option is to export your credentials as environment variables:

```bash
export AWS_SECRET_ACCESS_KEY=...
export AWS_ACCESS_KEY_ID=...
```

Alternatively you can provide your credentials upon creation of any new SQSUtils instance:
 
```js
const queue = new SQSUtils({
  accessKeyId: 'AWS-ACCESS-KEY-ID',
  secretAccessKey: 'AWS-ACCESS-KEY',
  region: 'AWS-REGION',
  queueUrl: 'https://sqs.eu-west-1.amazonaws.com/account-id/queue-name'
});
```

You can also provide a pre-configured instance of the [AWS SQS](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html) client:

```js
const queue = new SQSUtils({
  aws: new AWS.SQS(),
  queueUrl: 'https://sqs.eu-west-1.amazonaws.com/account-id/queue-name'
});
```

### Continuous polling

This uses [sqs-consumer](https://github.com/bbc/sqs-consumer) to continuously poll the queue for messages. 
Just define a function that receives an SQS message and call a callback when the message has been processed.

```js
queue.listen({
    visibilityTimeout: 300,
    handleMessage: function(message, done) {
        // Do your message handling in here
        console.log(message);
        // Remove the message from the queue
        done();
    },
    handleError: function(err) {
        // Handle errors
        console.log(err);
    }
});
```

* The queue is polled continuously for messages using [long polling](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html).
* Messages are deleted from the queue once `done()` is called.
* Calling `done(err)` with an error object will cause the message to be left on the queue. An [SQS redrive policy](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html) can be used to move messages that cannot be processed to a dead letter queue.

To stop listening for new messages simply call `.stop()`:

```js
queue.stop();
```

### Polling a single message

You can also poll the single next message from the queue.

```js
queue.receiveMessage({
    visibilityTimeout: 300
}, function(err, data) {
    console.log(data);
});
```

### Sending messages

To send new messages to the queue use `.sendMessage()`:

```js
queue.sendMessage({
    message: { text: 'hello' },
    delaySeconds: 0
}, function(err) {
    // Error handling here...
});
```

## License

[MIT](https://opensource.org/licenses/MIT)