# emailtools
Node JS set of tools to ease working with Email protocols. 

This module is just a combination of several great nodejs modules for working with emails including

* [IMAP](https://github.com/mscdex/node-imap)
* [MailParser](https://www.npmjs.com/package/mailparser)

with an abstraction layer on top of them to make working with emails easier. The main target is simplicity so if more complex logic and processing is required the modules should be used directly.

The module is under active development at the moment and is mainly used for our internal projects.

## Members

<dl>
<dt><a href="#IMAP">IMAP</a></dt>
<dd><p>IMAP functions wrapper</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#_parseMessage">_parseMessage(message)</a> ⇒ <code>Promise</code></dt>
<dd><p>Internal function used to parse email message using MailParser</p>
</dd>
</dl>

<a name="IMAP"></a>

## IMAP
IMAP functions wrapper

**Kind**: global variable  

* [IMAP](#IMAP)
    * [.connect()](#IMAP.connect) ⇒ <code>Imap</code>
    * [.test()](#IMAP.test) ⇒ <code>Promise</code>
    * [.getFolders()](#IMAP.getFolders) ⇒ <code>Promise</code>
    * [.getMessageHeaders()](#IMAP.getMessageHeaders) ⇒ <code>Promise</code>
    * [.readMessage()](#IMAP.readMessage) ⇒ <code>Promise</code>

<a name="IMAP.connect"></a>

### IMAP.connect() ⇒ <code>Imap</code>
Used to establish IMAP connection to the server

**Kind**: static method of <code>[IMAP](#IMAP)</code>  
**Returns**: <code>Imap</code> - - IMAP connection instance with active connection  

| Param | Type | Description |
| --- | --- | --- |
| options.user | <code>string</code> | IMAP account user |
| options.password | <code>string</code> | IMAP account password |
| options.host | <code>string</code> | IMAP host server |
| options.port | <code>string</code> | IMAP host server port |
| options.tls | <code>tls</code> | IMAP TLS connection flag |

<a name="IMAP.test"></a>

### IMAP.test() ⇒ <code>Promise</code>
Test IMAP connection - Resolved on success and Rejected on failure

**Kind**: static method of <code>[IMAP](#IMAP)</code>  

| Param | Type | Description |
| --- | --- | --- |
| options.connection | <code>object</code> | Connection options passed to connect() function |

<a name="IMAP.getFolders"></a>

### IMAP.getFolders() ⇒ <code>Promise</code>
Get whole folder structure for provided account. Format of the structure is defined by
several flags. By default just an array of folder names is returned.

**Kind**: static method of <code>[IMAP](#IMAP)</code>  
**Returns**: <code>Promise</code> - - Resolved with structure defined by the flags  

| Param | Type | Description |
| --- | --- | --- |
| options.connection | <code>object</code> | Connection options passed to connect() function |
| options.jstree | <code>boolean</code> | If true returned structure is compatible with a jsTree library |
| options.raw | <code>boolean</code> | If true returned structure is returned as received from Imap library |

<a name="IMAP.getMessageHeaders"></a>

### IMAP.getMessageHeaders() ⇒ <code>Promise</code>
Get headers (index) of latest messages of specified folder. Number of messages
is defined by length flag.

Please note that messages are sorted by internal Sequence number as defined by Imap library.

**Kind**: static method of <code>[IMAP](#IMAP)</code>  
**Returns**: <code>Promise</code> - - Resolved with Dictionary where Sequence number is used as key and header object as value  

| Param | Type | Description |
| --- | --- | --- |
| options.connection | <code>object</code> | Connection options passed to connect() function |
| options.folderName | <code>string</code> | Valid folder name for given imap account |
| options.length | <code>int</code> | Number of messages returned |

<a name="IMAP.readMessage"></a>

### IMAP.readMessage() ⇒ <code>Promise</code>
Read and parse message.

**Kind**: static method of <code>[IMAP](#IMAP)</code>  
**Returns**: <code>Promise</code> - - Resolved with object representing the message. (returned from MailParser)  

| Param | Type | Description |
| --- | --- | --- |
| options.connection | <code>object</code> | Connection options passed to connect() function |
| options.folderName | <code>string</code> | Valid folder name for given imap account |
| options.messageSeqNo | <code>int</code> | Message sequence number with the folder |

<a name="_parseMessage"></a>

## _parseMessage(message) ⇒ <code>Promise</code>
Internal function used to parse email message using MailParser

**Kind**: global function  
**Returns**: <code>Promise</code> - - Resolved with object returned from MailParser  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message body |