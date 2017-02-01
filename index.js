'use strict';

/**
 * Module dependencies.
 */

var AWS = require('aws-sdk');
var Consumer = require('sqs-consumer');

/**
 * Build SQS-based micro-services without the boilerplate.
 */

class SQSUtils {

    /**
     * Create a new SQSUtils instance.
     */

    constructor(options) {
        options = options || {};
        this.queueUrl = options.queueUrl;
        this.sqs = options.sqs || new AWS.SQS({
                accessKeyId: options.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
                region: options.region || process.env.AWS_REGION || 'eu-west-1',
            });
        this.bot = null; // Initially do not create a sqs-consumer bot for polling
    }

    /**
     * Continuously pull the queue for messages using long polling.
     */

    listen(options) {
        options = options || {};
        if(this.bot === null) {
            // Create new sqs-consumer instance to poll messages
            this.bot = new Consumer({
                queueUrl: this.queueUrl,
                sqs: this.sqs,
                batchSize: options.batchSize || 1,
                visibilityTimeout: options.visibilityTimeout || 300, // 5 minutes
                handleMessage: options.handleMessage
            });
            this.bot.on('err', options.handleError);
        }
        this.bot.start();
    }

    /**
     * Stop polling messages from the queue.
     */

    stop() {
        // Call stop on sqs-consumer
        this.bot.stop();
    }

    /**
     * Send message to the queue and trigger callback.
     */

    sendMessage(options, callback) {
        options = options || {};
        var params = {
            MessageBody: JSON.stringify(options.message) || '{}',
            QueueUrl: this.queueUrl,
            DelaySeconds: options.delaySeconds || 0
        };
        this.sqs.sendMessage(params, callback);
    }

    /**
     * Pull the very next message from the queue.
     */

    receiveMessage(options, callback) {
        options = options || {};
        var params = {
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 1, // Make sure only one message is pulled
            VisibilityTimeout: options.visibilityTimeout || 300 // 5 minutes
        };
        this.sqs.receiveMessage(params, callback);
    }

    /**
     * Delete a single message from the queue.
     */

    deleteMessage(message, callback) {
        var params = {
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle
        };
        this.sqs.deleteMessage(params, callback);
    }

    /**
     * DANGER: Deletes all messages in the queue.
     */

    purgeQueue(callback) {
        var params = {
            QueueUrl: this.queueUrl
        };
        this.sqs.purgeQueue(params, callback);
    }

}

module.exports = SQSUtils;
