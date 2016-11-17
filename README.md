<a name="module_EmailTools"></a>

## EmailTools
Set of NodeJS functions to make working with emails easier. Please do not expect any sophisticated logic the main goal is to keep it simple and straightforward to use.
 This module serves as an abstraction layer on top of several great modules for working different email protocols.


* [EmailTools](#module_EmailTools)
    * [.SMTP](#module_EmailTools.SMTP)
        * [.connect(options)](#module_EmailTools.SMTP.connect) ⇒ <code>Object</code>
        * [.test(options)](#module_EmailTools.SMTP.test) ⇒ <code>Promise</code>
        * [.send(options)](#module_EmailTools.SMTP.send) ⇒ <code>Promise</code>
    * [.IMAP](#module_EmailTools.IMAP)
        * [.connect(options)](#module_EmailTools.IMAP.connect) ⇒ <code>Imap</code>
        * [.test(options)](#module_EmailTools.IMAP.test) ⇒ <code>Promise</code>
        * [.getFolders(options)](#module_EmailTools.IMAP.getFolders) ⇒ <code>Promise</code>
        * [.getFolderInfo(options)](#module_EmailTools.IMAP.getFolderInfo) ⇒ <code>Promise</code>
        * [.getLastMessagesHeaders(options)](#module_EmailTools.IMAP.getLastMessagesHeaders) ⇒ <code>Promise</code>
        * [.searchMessageHeaders(options)](#module_EmailTools.IMAP.searchMessageHeaders) ⇒ <code>Promise</code>
        * [.readMessage(options)](#module_EmailTools.IMAP.readMessage) ⇒ <code>Promise</code>
        * [.readMessages(options)](#module_EmailTools.IMAP.readMessages) ⇒ <code>Promise</code>
    * [.template(inputText, vars)](#module_EmailTools.template) ⇒ <code>string</code>

<a name="module_EmailTools.SMTP"></a>

### EmailTools.SMTP
Provides all the SMTP functions.

**Kind**: static property of <code>[EmailTools](#module_EmailTools)</code>  

* [.SMTP](#module_EmailTools.SMTP)
    * [.connect(options)](#module_EmailTools.SMTP.connect) ⇒ <code>Object</code>
    * [.test(options)](#module_EmailTools.SMTP.test) ⇒ <code>Promise</code>
    * [.send(options)](#module_EmailTools.SMTP.send) ⇒ <code>Promise</code>

<a name="module_EmailTools.SMTP.connect"></a>

#### SMTP.connect(options) ⇒ <code>Object</code>
Establish SMTP connection to host

**Kind**: static method of <code>[SMTP](#module_EmailTools.SMTP)</code>  
**Returns**: <code>Object</code> - SMTP connection instance as returned from [nodemailer](https://github.com/nodemailer/nodemailer)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Connection options |
| options.user | <code>string</code> | SMTP account user |
| options.password | <code>string</code> | SMTP account password |
| options.host | <code>string</code> | SMTP host server |
| options.port | <code>string</code> | SMTP host server port |
| options.tls | <code>tls</code> | SMTP TLS connection flag |

<a name="module_EmailTools.SMTP.test"></a>

#### SMTP.test(options) ⇒ <code>Promise</code>
Test SMTP connection

**Kind**: static method of <code>[SMTP](#module_EmailTools.SMTP)</code>  
**Returns**: <code>Promise</code> - Resolved on success and rejected on failure  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.SMTP.connect) to establish the connection with host |

<a name="module_EmailTools.SMTP.send"></a>

#### SMTP.send(options) ⇒ <code>Promise</code>
Send email

**Kind**: static method of <code>[SMTP](#module_EmailTools.SMTP)</code>  
**Returns**: <code>Promise</code> - Resolved on success and rejected on failure  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.SMTP.connect) to establish the connection with host |
| options.templateVars | <code>Object</code> | If provided the template() function is applied to Subject and HTML |
| options.data | <code>Object</code> | Email message definition |
| options.data.from | <code>string</code> &#124; <code>Object</code> | Either string of sender or object having name and address attributes |
| options.data.to | <code>string</code> &#124; <code>Array</code> | Comma seperated or an Array of recipients |
| options.data.cc | <code>string</code> &#124; <code>Array</code> | Comma seperated or an Array of recipients |
| options.data.bcc | <code>string</code> &#124; <code>Array</code> | Comma seperated or an Array of recipients |
| options.data.subject | <code>string</code> | The subject of the email |
| options.data.html | <code>string</code> | Actual message send as html (automatically converted and added to a text field) |

<a name="module_EmailTools.IMAP"></a>

### EmailTools.IMAP
Provides all the IMAP functions.IMAP connection is established automatically upon every function call. This is as designed since natureof application this module was originally developed wouldn't allow to keep connection alive. This behaviourmight be extended in the future to keep connection alive using a flag.

**Kind**: static property of <code>[EmailTools](#module_EmailTools)</code>  

* [.IMAP](#module_EmailTools.IMAP)
    * [.connect(options)](#module_EmailTools.IMAP.connect) ⇒ <code>Imap</code>
    * [.test(options)](#module_EmailTools.IMAP.test) ⇒ <code>Promise</code>
    * [.getFolders(options)](#module_EmailTools.IMAP.getFolders) ⇒ <code>Promise</code>
    * [.getFolderInfo(options)](#module_EmailTools.IMAP.getFolderInfo) ⇒ <code>Promise</code>
    * [.getLastMessagesHeaders(options)](#module_EmailTools.IMAP.getLastMessagesHeaders) ⇒ <code>Promise</code>
    * [.searchMessageHeaders(options)](#module_EmailTools.IMAP.searchMessageHeaders) ⇒ <code>Promise</code>
    * [.readMessage(options)](#module_EmailTools.IMAP.readMessage) ⇒ <code>Promise</code>
    * [.readMessages(options)](#module_EmailTools.IMAP.readMessages) ⇒ <code>Promise</code>

<a name="module_EmailTools.IMAP.connect"></a>

#### IMAP.connect(options) ⇒ <code>Imap</code>
Establish IMAP connection to host

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Imap</code> - IMAP connection instance as returned from [node-imap](https://github.com/mscdex/node-imap)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Connection options |
| options.user | <code>string</code> | IMAP account user |
| options.password | <code>string</code> | IMAP account password |
| options.host | <code>string</code> | IMAP host server |
| options.port | <code>string</code> | IMAP host server port |
| options.tls | <code>tls</code> | IMAP TLS connection flag |

<a name="module_EmailTools.IMAP.test"></a>

#### IMAP.test(options) ⇒ <code>Promise</code>
Test IMAP connection

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved on success and rejected on failure  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.IMAP.connect) to establish the connection with host |

<a name="module_EmailTools.IMAP.getFolders"></a>

#### IMAP.getFolders(options) ⇒ <code>Promise</code>
Get whole folder structure for provided IMAP account. Format of the structure is defined bythe flags described below - If no flag is set returned format is a string array containingfolder identifiers.

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with structure defined by the flags above  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.jstree | <code>boolean</code> | If true returned structure is compatible with a [jsTree](https://github.com/vakata/jstree) module |
| options.raw | <code>boolean</code> | If true returned as received from [node-imap](https://github.com/mscdex/node-imap) |

<a name="module_EmailTools.IMAP.getFolderInfo"></a>

#### IMAP.getFolderInfo(options) ⇒ <code>Promise</code>
Get folder information for provided IMAP account

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with the folder IMAP information  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>Object</code> | Name of the folder |

<a name="module_EmailTools.IMAP.getLastMessagesHeaders"></a>

#### IMAP.getLastMessagesHeaders(options) ⇒ <code>Promise</code>
Get headers of latest messages of specified folder for provided account. Number of messagesis defined by the length flag.Seqno is used to sort emails not UID.

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with dictionary where Sequence number is used as key and header object as value  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>string</code> | Valid folder name for given IMAP account |
| options.length | <code>int</code> | Number of messages returned |

<a name="module_EmailTools.IMAP.searchMessageHeaders"></a>

#### IMAP.searchMessageHeaders(options) ⇒ <code>Promise</code>
Search FROM and TO

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with dictionary where Sequence number is used as key and header object as value  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>string</code> | Valid folder name for given IMAP account |
| options.search | <code>string</code> | Phrase to search for |

<a name="module_EmailTools.IMAP.readMessage"></a>

#### IMAP.readMessage(options) ⇒ <code>Promise</code>
Read and parse message specified by folder name and sequence number.

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with [MailParser](https://github.com/andris9/mailparser) message object  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>string</code> | Valid folder name for given IMAP account |
| options.messageSeqNo | <code>int</code> | Message sequence number with the folder |

<a name="module_EmailTools.IMAP.readMessages"></a>

#### IMAP.readMessages(options) ⇒ <code>Promise</code>
Read and parse messages specified by folder name and sequence number range

**Kind**: static method of <code>[IMAP](#module_EmailTools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with [MailParser](https://github.com/andris9/mailparser) message object  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [connect()](module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>string</code> | Valid folder name for given IMAP account |
| options.seqNoRange | <code>Array.&lt;int&gt;</code> | Sequence number range FROM, TO |

<a name="module_EmailTools.template"></a>

### EmailTools.template(inputText, vars) ⇒ <code>string</code>
All the text within %?% entries is replaced with a value from matching keys from vars

**Kind**: static method of <code>[EmailTools](#module_EmailTools)</code>  

| Param | Type | Description |
| --- | --- | --- |
| inputText | <code>string</code> | Input text used as a template |
| vars | <code>Object</code> | Variables used to replace template entries |

