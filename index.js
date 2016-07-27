const Imap = require('imap');
const moment = require('moment');
const MailParser = require('mailparser').MailParser;

/**
 * Internal function used to parse email message using MailParser
 *
 * @param {string} message - Message body
 * @return {Promise} - Resolved with object returned from MailParser
 */
function _parseMessage(message) {
    return new Promise((resolve, reject)=>{
        const mailParser = new MailParser();
        mailParser.on("end", parsedMessage=>resolve(parsedMessage));
        mailParser.write(message);
        mailParser.end();
    })
}

module.exports.Imap = {
    /**
     * Used to establish IMAP connection to the server
     *
     * @param {string} options.user - IMAP account user
     * @param {string} options.password - IMAP account password
     * @param {string} options.host - IMAP host server
     * @param {string} options.port - IMAP host server port
     * @param {tls} options.tls - IMAP TLS connection flag
     * @return {Imap} - IMAP connection instance with active connection
     */
    connect: (options) => {
        return new Imap({
            user: options.user,
            password: options.password,
            host: options.host,
            port: options.port,
            tls: options.tls
        });
    },
    /**
     * Test IMAP connection - Resolved on success and Rejected on failure
     *
     * @param {object} options.connection - Connection options passed to connect() function
     * @return {Promise}
     */
    test: (options) => {
        return new Promise((resolve, reject)=>{
            const imap = this.Imap.connect(options.connection);
            imap.once('error', err=>reject());
            imap.once('end', ()=>resolve());
            imap.once('ready', ()=>imap.end());
            imap.connect();
        });
    },
    /**
     * Get whole folder structure for provided account. Format of the structure is defined by
     * several flags. By default just an array of folder names is returned.
     *
     * @param {object} options.connection - Connection options passed to connect() function
     * @param {boolean} options.jstree - If true returned structure is compatible with a jsTree library
     * @param {boolean} options.raw - If true returned structure is returned as received from Imap library
     * @return {Promise} - Resolved with structure defined by the flags
     */
    getFolders: (options) => {
        return new Promise((resolve, reject)=>{
            var folders;
            const imap = this.Imap.connect(options.connection);
            imap.once('error', err=>{
                imap.end();
                reject(err);
            });
            imap.once('ready', () => {
                imap.getBoxes((err, boxes)=>{
                    if(err) {
                        reject(err);
                    } else {
                        if(options.jstree) {
                            folders = [];
                            function _boxesToJstree(name, obj, parents){
                                var id = parents ? parents + '.' + name : name;
                                var jsFolder = {
                                    id: options.connection+'_folder_'+id,
                                    text: name,
                                    type: 'EmailFolder',
                                    data: {
                                        name:id,
                                        attribs:obj.attribs,
                                        delimiter:obj.delimiter
                                    },
                                    children: []
                                };
                                if(obj.children && obj.children != null) {
                                    for(var child in obj.children) {
                                        jsFolder.children.push(_boxesToJstree(child, obj.children[child], id));
                                    }
                                }
                                return jsFolder;
                            }
                            for(var box in boxes) {
                                folders.push(_boxesToJstree(box, boxes[box]));
                            }
                        } else {
                            if(options.raw) {
                                folders = boxes;
                            } else {
                                folders = [];
                                function _appendToArray(name, obj, parents) {
                                    var code = parents ? parents + '.' + name : name;
                                    folders.push(code);
                                    if(obj.children && obj.children != null) {
                                        for(var child in obj.children) {
                                            _appendToArray(child, obj.children[child], code);
                                        }
                                    }
                                }
                                for(var box in boxes) {
                                    _appendToArray(box, boxes[box]);
                                }
                            }
                        }
                    }
                    imap.end();
                    resolve(folders);
                });
            });
            imap.connect();
        });
    },
    /**
     * Get headers (index) of latest messages of specified folder. Number of messages
     * is defined by length flag.
     *
     * Please note that messages are sorted by internal Sequence number as defined by Imap library.
     *
     * @param {object} options.connection - Connection options passed to connect() function
     * @param {string} options.folderName - Valid folder name for given imap account
     * @param {int} options.length - Number of messages returned
     * @return {Promise} - Resolved with Dictionary where Sequence number is used as key and header object as value
     */
    getMessageHeaders: (options) => {
        return new Promise((resolve, reject)=>{
            const imap = this.Imap.connect(options.connection);
            var messages = {};
            imap.once('error', err=>{
                imap.end();
                reject(err);
            });
            imap.once('ready', () => {
                imap.openBox(options.folderName, true, (err, box)=>{
                    if(err) reject(err);
                    if(!box) reject(new Error("Couldn't open box - "+options.folderName));
                    imap.seq.fetch(
                        Math.max(1, box.messages.total-options.length) + ':*',
                        {bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'}
                    ).once('error', fetchErr=>{
                        imap.end();
                        reject(fetchErr);
                    }).once('end', ()=>{
                        imap.end();
                        resolve(messages);
                    }).on('message', (msg, seqno)=>{
                        msg.on('body', (stream, info)=>{
                            var buffer = '';
                            stream.on('data', chunk=>{
                                buffer += chunk.toString('utf8');
                            }).once('end', ()=>{
                                var header = Imap.parseHeader(buffer);
                                if(header && header.date) {
                                    if(Array.isArray(header.date)) {
                                        header.date = moment(new Date(header.date[0])).format('DD/MM/YY HH:mm');
                                    } else {
                                        header.date = moment(new Date(header.date)).format('DD/MM/YY HH:mm');
                                    }
                                }
                                messages[seqno] = header;
                            });
                        });
                    })
                })
            });
            imap.connect();
        });
    },
    /**
     * Read and parse message.
     *
     * @param {object} options.connection - Connection options passed to connect() function
     * @param {string} options.folderName - Valid folder name for given imap account
     * @param {int} options.messageSeqNo - Message sequence number with the folder
     * @return {Promise} - Resolved with object representing the message. (returned from MailParser)
     */
    readMessage: (options) => {
        return new Promise((resolve, reject)=>{
            const imap = this.Imap.connect(options.connection);
            imap.once('error', err=>{
                imap.end();
                reject(err);
            });
            imap.once('ready', () => {
                imap.openBox(options.folderName, true, (err, box)=>{
                    if(err) reject(err);
                    if(!box) reject(new Error("Couldn't open box - "+options.folderName));
                    var message = '';
                    imap.seq.fetch(
                        options.messageSeqNo + ':' + options.messageSeqNo,
                        {bodies: ''}
                    ).once('error', fetchErr=>{
                        imap.end();
                        reject(fetchErr);
                    }).once('end', ()=>{
                        imap.end();
                        _parseMessage(message).then(parsedMessage=>resolve(parsedMessage)).catch(err=>reject(err));
                    }).on('message', (msg, seqno)=>{
                        msg.on('body', (stream, info)=>{
                            stream.on('data', chunk=>message+=chunk.toString('utf8'));
                        });
                    })
                })
            });
            imap.connect();
        });
    }
};