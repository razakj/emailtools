const Imap = require('imap');
const moment = require('moment');
const MailParser = require('mailparser').MailParser;
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const crypto = require('crypto');

/**
 Set of NodeJS functions to make working with emails easier. Please do not expect any sophisticated logic the main goal is to keep it simple and straightforward to use.
 This module serves as an abstraction layer on top of several great modules for working different email protocols.
 @module EmailTools
 */


function _getUid (from, to, date, subject) {
    if(Array.isArray(date)) date = date[0];
    if(Array.isArray(from)) from = from[0];
    if(Array.isArray(to)) to = to[0];
    return crypto.createHash('md5').update(subject+from+to+date).digest('hex');
}
module.exports.getUid = _getUid;

function normalizeFromAndTo(arr) {
    var str = "";
    if(arr && arr.length > 0) {
        arr.forEach((entry,ix)=>{
            str += entry.address;
            if(ix < arr.length-1) str += ', ';
        })
    }
    return str;
}
module.exports.normalizeFromAndTo = normalizeFromAndTo;

/**
 * Internal function used to parse email message using MailParser
 *
 * @param {string} message - Message body
 * @return {Promise} Resolved with object returned from MailParser
 * @private
 */
function _parseMessage(message) {
    return new Promise((resolve, reject)=>{
        const mailParser = new MailParser();
        mailParser.on("end", parsedMessage=>{
            parsedMessage['fromString'] = normalizeFromAndTo(parsedMessage.from);
            parsedMessage['toString'] = normalizeFromAndTo(parsedMessage.to);
            parsedMessage['ccString'] = normalizeFromAndTo(parsedMessage.cc);

            var header = Imap.parseHeader(message);
            parsedMessage['uid'] = _getUid(header.from, header.to, header.date, header.subject);
            resolve(parsedMessage)
        });
        mailParser.write(message);
        mailParser.end();
    })
}

/**
 * All the text within %?% entries is replaced with a value from matching keys from vars
 *
 * @param {string} inputText Input text used as a template
 * @param {Object} vars Variables used to replace template entries
 * @return {string}
 */
module.exports.template = (inputText, vars) => {
    if(inputText && typeof(inputText) === "string") {
        return inputText.replace(new RegExp(Object.keys(vars).map(v=>{return '%'+v+'%'}).join("|"),"gm"), (m)=>{
            return vars[m.replace(/%/g, '')];
        });
    }
    return inputText;
};

/**
 * Provides all the SMTP functions.
 */
module.exports.SMTP = {
    /**
     * Establish SMTP connection to host
     *
     * @param {Object} options - Connection options
     * @param {string} options.user - SMTP account user
     * @param {string} options.password - SMTP account password
     * @param {string} options.host - SMTP host server
     * @param {string} options.port - SMTP host server port
     * @param {tls} options.tls - SMTP TLS connection flag
     * @return {Object} SMTP connection instance as returned from [nodemailer]{@link https://github.com/nodemailer/nodemailer}
     */
    connect: (options) => {
        return nodemailer.createTransport({
            host: options.host,
            port: options.port,
            secure: options.tls,
            auth: {
                user: options.user,
                pass: options.password
            }
        });
    },
    /**
     * Test SMTP connection
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.SMTP.connect} to establish the connection with host
     * @return {Promise} Resolved on success and rejected on failure
     */
    test: (options) => {
        return new Promise((resolve, reject)=>{
            const smtp = this.SMTP.connect(options.connection);
            smtp.verify((err, success) => {
                smtp.close();
                if(err) {
                    reject(err)
                } else {
                    resolve({status: 'OK'});
                }
            })
        });
    },
    /**
     * Send email
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.SMTP.connect} to establish the connection with host
     * @param {Object} options.templateVars If provided the template() function is applied to Subject and HTML
     * @param {Object} options.data Email message definition
     * @param {string|Object} options.data.from Either string of sender or object having name and address attributes
     * @param {string|Array} options.data.to Comma seperated or an Array of recipients
     * @param {string|Array} options.data.cc Comma seperated or an Array of recipients
     * @param {string|Array} options.data.bcc Comma seperated or an Array of recipients
     * @param {string} options.data.subject The subject of the email
     * @param {string} options.data.html Actual message send as html (automatically converted and added to a text field)
     * @return {Promise} Resolved on success and rejected on failure
     */
    send: (options) => {
        return new Promise((resolve, reject)=>{
            if(!options) reject(new Error("Options can't be empty"))
            if(!options.data) reject(new Error("Options.Data can't be empty"))
            const smtp = this.SMTP.connect(options.connection);
            if(options.templateVars) {
                options.data['html'] = this.template(options.data.html, options.templateVars);
                options.data['subject'] = this.template(options.data.subject, options.templateVars);
            }
            options.data['text'] = htmlToText.fromString(options.data.html, {
                ignoreImage: true
            });
            smtp.sendMail(options.data, (err, info)=>{
                smtp.close();
                if(err){
                    reject(err);
                } else {
                    info['text'] = options.data.text;
                    info['html'] = options.data.html;
                    info['subject'] = options.data.subject;
                    resolve(info);
                }
            })
        });
    }
};

/**
 * Provides all the IMAP functions.
 *
 * IMAP connection is established automatically upon every function call. This is as designed since nature
 * of application this module was originally developed wouldn't allow to keep connection alive. This behaviour
 * might be extended in the future to keep connection alive using a flag.
 *
 */
module.exports.IMAP = {
    _imapFetchHeadersHandler: fetch => {
        return new Promise((resolve, reject)=>{
            var messages = [];
            fetch.once('error', fetchErr=>{
                reject(fetchErr);
            }).once('end', ()=>{
                resolve(messages.sort((a,b)=>{
                    if (a.seqno > b.seqno)
                        return -1;
                    if (a.seqno < b.seqno)
                        return 1;
                    return 0;
                }));
            }).on('message', (msg, seqno)=>{
                msg.on('body', (stream, info)=>{
                    var buffer = '';
                    stream.on('data', chunk=>{
                        buffer += chunk.toString('utf8');
                    }).once('end', ()=>{
                        var header = Imap.parseHeader(buffer);
                        header.uid = _getUid(header.from, header.to, header.date, header.subject);
                        header.seqno = seqno;
                        if(header && header.date) {
                            if(Array.isArray(header.date)) {
                                header.date = moment(new Date(header.date[0])).format('DD/MM/YY HH:mm');
                            } else {
                                header.date = moment(new Date(header.date)).format('DD/MM/YY HH:mm');
                            }
                        }
                        messages.push(header);
                    });
                });
            });
        });
    },
    _imapConnectAndOpenBox: (options,cb, end) => {
        if (!options.connection) {
            end(new Error("Connection must be provided"));
        } else if(!options.folderName) {
            end(new Error("Folder name must be provided"));
        } else {
            const imap = this.IMAP.connect(options.connection);
            var _err, _data;
            imap.once('error', err=> {
                imap.destroy();
                end(err);
            });
            imap.once('ready', ()=> {
                imap.openBox(options.folderName, options.folderReadonly ? true : false, (err, box)=> {
                    if (err) {
                        _err = err;
                        imap.end();
                    } else if(!box) {
                        _err = new Error("Unable to open folder" + options.folderName);
                        imap.end();
                    } else {
                        cb({imap: imap, box: box}, (err, data)=> {
                            _data = data;
                            _err = err;
                            imap.closeBox(err=> {
                                if(err && !_err) _err = err;
                                imap.end();
                            })
                        });
                    }
                })
            });
            imap.once('end', () => {
                end(_err, _data);
            });
            imap.connect();
        }
    },
    /**
     * Establish IMAP connection to host
     *
     * @param {Object} options - Connection options
     * @param {string} options.user - IMAP account user
     * @param {string} options.password - IMAP account password
     * @param {string} options.host - IMAP host server
     * @param {string} options.port - IMAP host server port
     * @param {tls} options.tls - IMAP TLS connection flag
     * @return {Imap} IMAP connection instance as returned from [node-imap]{@link https://github.com/mscdex/node-imap}
     */
    connect: (options) => {
        return new Imap({
            user: options.user,
            password: options.password,
            host: options.host,
            port: options.port,
            tls: options.tls,
            connTimeout: options.connTimeout ? options.connTimeout : 10000,
            authTimeout: options.authTimeout ? options.authTimeout : 5000,
            keepalive: false,
            debug: typeof (options.debug) === 'function' ? options.debug : function(debugMsg) {
                if(options.debug) console.log(debugMsg);
            }
        });
    },
    /**
     * Test IMAP connection
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.IMAP.connect} to establish the connection with host
     * @return {Promise} Resolved on success and rejected on failure
     */
    test: (options) => {
        return new Promise((resolve, reject)=>{
            const imap = this.IMAP.connect(options.connection);
            imap.once('error', err=>reject(err));
            imap.once('end', ()=>resolve());
            imap.once('ready', ()=>imap.end());
            imap.connect();
        });
    },
    /**
     * Get whole folder structure for provided IMAP account. Format of the structure is defined by
     * the flags described below - If no flag is set returned format is a string array containing
     * folder identifiers.
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.IMAP.connect} to establish the connection with host
     * @param {boolean} options.jstree - If true returned structure is compatible with a [jsTree]{@link https://github.com/vakata/jstree} module
     * @param {boolean} options.raw - If true returned as received from [node-imap]{@link https://github.com/mscdex/node-imap}
     * @return {Promise} Resolved with structure defined by the flags above
     */
    getFolders: (options) => {
        return new Promise((resolve, reject)=>{
            var folders;
            const imap = this.IMAP.connect(options.connection);
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
                    imap.once('end', ()=>{
                        resolve(folders);
                    });
                    imap.end();
                });
            });
            if(imap.state === 'disconnected') imap.connect();
        });
    },
    /**
     * Get folder information for provided IMAP account
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.IMAP.connect} to establish the connection with host
     * @param {Object} options.folderName Name of the folder
     * @return {Promise} Resolved with the folder IMAP information
     */
    getFolderInfo: (options) => {
        return new Promise((resolve, reject)=>{
            this.IMAP._imapConnectAndOpenBox(options, (info, next)=>{
                next(null, info.box);
            }, (err, data) => {
                err ? reject(err) : resolve(data);
            })
        });
    },
    /**
     * Get headers of latest messages of specified folder for provided account. Number of messages
     * is defined by the length flag.
     *
     * Seqno is used to sort emails not UID.
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.IMAP.connect} to establish the connection with host
     * @param {string} options.folderName - Valid folder name for given IMAP account
     * @param {int} options.length - Number of messages returned
     * @return {Promise} Resolved with dictionary where Sequence number is used as key and header object as value
     */
    getLastMessagesHeaders: (options) => {
        return new Promise((resolve, reject)=>{
            this.IMAP._imapConnectAndOpenBox(options, (info, next)=>{
                if(info.box.messages.total == 0) {
                    next(null, []);
                } else {
                    var fetch = info.imap.seq.fetch(
                        Math.max(1, info.box.messages.total-(options.length ? options.length : 50)) + ':*',
                        {bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'}
                    );
                    this.IMAP._imapFetchHeadersHandler(fetch).then(messages=>{
                        next(null, messages);
                    }).catch(next);
                }
            }, (err, data)=> {
                err ? reject(err) : resolve(data);
            });
        });
    },
    /**
     * Search FROM and TO
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link #module_emailtools.IMAP.connect} to establish the connection with host
     * @param {string} options.folderName Valid folder name for given IMAP account
     * @param {string} options.search Phrase to search for
     * @return {Promise} Resolved with dictionary where Sequence number is used as key and header object as value
     */
    searchMessageHeaders: options=>{
        return new Promise((resolve, reject)=>{
            this.IMAP._imapConnectAndOpenBox(options, (info,next)=>{
                if(info.box.messages.total == 0) {
                    next(null, []);
                } else {
                    info.imap.search([['OR', ['TO', options.search], ['FROM', options.search]]], (err, results) => {
                        if (err) {
                            next(err);
                        } else {
                            if(results.length > 0) {
                                const fetch = info.imap.fetch(results, {bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'});
                                this.IMAP._imapFetchHeadersHandler(fetch).then(messages=>{
                                    next(null, messages)
                                }).catch(next);
                            } else {
                                next(null, []);
                            }
                        }
                    });
                }
            }, (err, data)=> {
                err ? reject(err) : resolve(data);
            });
        });
    },
    /**
     * Read and parse message specified by folder name and sequence number.
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link module_emailtools.IMAP.connect} to establish the connection with host
     * @param {string} options.folderName  Valid folder name for given IMAP account
     * @param {int} options.messageSeqNo Message sequence number with the folder
     * @return {Promise} Resolved with [MailParser]{@link https://github.com/andris9/mailparser} message object
     */
    readMessage: (options) => {
        return new Promise((resolve, reject)=>{
            this.IMAP._imapConnectAndOpenBox(options, (info, next)=>{
                var message = '';
                info.imap.seq.fetch(options.messageSeqNo, {bodies: ''}).once('error', fetchErr=>{
                    next(fetchErr);
                }).once('end', ()=>{
                    _parseMessage(message).then(parsedMessage=>{
                        next(null, parsedMessage)
                    }).catch(next);
                }).on('message', (msg, seqno)=>{
                    msg.on('body', (stream, info)=>{
                        stream.on('data', chunk=>message+=chunk.toString('utf8'));
                    });
                })
            }, (err, data)=> {
                err ? reject(err) : resolve(data);
            });
        });
    },
    /**
     * Read and parse messages specified by folder name and sequence number range
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link module_emailtools.IMAP.connect} to establish the connection with host
     * @param {string} options.folderName  Valid folder name for given IMAP account
     * @param {int[]} options.seqNoRange Sequence number range FROM, TO
     * @return {Promise} Resolved with [MailParser]{@link https://github.com/andris9/mailparser} message object
     */
    readMessages: (options) => {
        return new Promise((resolve, reject)=>{
            this.IMAP._imapConnectAndOpenBox(options, (info, next)=>{
                var msgBuffers = [];
                const f = info.imap.seq.fetch(options.seqNoRange[0]+':'+options.seqNoRange[1], {bodies: ''});
                f.once('error', next);
                f.once('end', ()=>{
                    var parsers = [];
                    msgBuffers.forEach(buf=>{
                        parsers.push(_parseMessage(buf));
                    });
                    Promise.all(parsers).then(res=>{
                        next(null, res);
                    }).catch(reject);
                });
                f.on('message', (msg, seqno)=>{
                    msg.on('body', (stream, info)=>{
                        var buffer = '';
                        stream.on('data', chunk=>{
                            buffer += chunk.toString('utf8');
                        }).once('end', ()=>{
                            msgBuffers.push(buffer);
                        });
                    });
                });
            }, (err, data)=> {
                err ? reject(err) : resolve(data);
            });
        });
    },
    /**
     * (NOT IMPLEMENTED) Appends message to the given folder of given account
     *
     * @param {Object} options
     * @param {Object} options.connection Input options passed to [connect()]{@link module_emailtools.IMAP.connect} to establish the connection with host
     * @param {string} options.folderName  Valid folder name for the given IMAP account
     * @param {Object} options.email Email object which shall be parsed and appended
     * @return {Promise}
     */
    appendMessage: (options) => {
        return new Promise((resolve, reject)=>{
            resolve();
            //if(!options.email) reject(new Error("Email object must be provided"));
            //var from = 'From: ';
            //var to = 'To: ';
            //var subject = 'Subject: ';
            //
            //if(options.email.from) {
            //    if(Array.isArray(options.email.from)) {
            //        options.email.from.forEach(f=>{
            //            if(typeof(f)==="string") {
            //                from += '<'+f+'>'
            //            } else if(typeof(f) === "object") {
            //                var fStr = '';
            //                if(f.hasOwnProperty('name')) {
            //                    fStr +=
            //                } else if(f.hasOwnProperty('address')) {
            //
            //                }
            //            }
            //        })
            //    }
            //}
            //
            //this.IMAP._imapConnectAndOpenBox(options, (info, next)=>{
            //    info.imap.append('test', {
            //        flags: 'Seen'
            //    }, next)
            //}, err => {
            //    err ? reject(err) : resolve();
            //});
        });
    }
};