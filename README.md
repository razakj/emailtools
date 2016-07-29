<a name="module_emailtools"></a>

## emailtools
Set of NodeJS functions to make working with emails easier. Please do not expect any sophisticated logic the main goal is to keep it simple and straightforward to use.

 This module serves as an abstraction layer on top of several great modules for working different email protocols.


* [emailtools](#module_emailtools)
    * [.IMAP](#module_emailtools.IMAP)
        * [.connect(options)](#module_emailtools.IMAP.connect) ⇒ <code>Imap</code>
        * [.test(options)](#module_emailtools.IMAP.test) ⇒ <code>Promise</code>
        * [.getFolders(options)](#module_emailtools.IMAP.getFolders) ⇒ <code>Promise</code>
        * [.getLastMessagesHeaders(options)](#module_emailtools.IMAP.getLastMessagesHeaders) ⇒ <code>Promise</code>
        * [.readMessage(options)](#module_emailtools.IMAP.readMessage) ⇒ <code>Promise</code>

<a name="module_emailtools.IMAP"></a>

### emailtools.IMAP
Provides all the IMAP functions.IMAP connection is established automatically upon every function call. This is as designed since natureof application this module was originally developed wouldn't allow to keep connection alive. This behaviourmight be extended in the future to keep connection alive using a flag.

**Kind**: static property of <code>[emailtools](#module_emailtools)</code>  

* [.IMAP](#module_emailtools.IMAP)
    * [.connect(options)](#module_emailtools.IMAP.connect) ⇒ <code>Imap</code>
    * [.test(options)](#module_emailtools.IMAP.test) ⇒ <code>Promise</code>
    * [.getFolders(options)](#module_emailtools.IMAP.getFolders) ⇒ <code>Promise</code>
    * [.getLastMessagesHeaders(options)](#module_emailtools.IMAP.getLastMessagesHeaders) ⇒ <code>Promise</code>
    * [.readMessage(options)](#module_emailtools.IMAP.readMessage) ⇒ <code>Promise</code>

<a name="module_emailtools.IMAP.connect"></a>

#### IMAP.connect(options) ⇒ <code>Imap</code>
Establish IMAP connection to host

**Kind**: static method of <code>[IMAP](#module_emailtools.IMAP)</code>  
**Returns**: <code>Imap</code> - IMAP connection instance as returned from [node-imap](https://github.com/mscdex/node-imap)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Connection options |
| options.user | <code>string</code> | IMAP account user |
| options.password | <code>string</code> | IMAP account password |
| options.host | <code>string</code> | IMAP host server |
| options.port | <code>string</code> | IMAP host server port |
| options.tls | <code>tls</code> | IMAP TLS connection flag |

<a name="module_emailtools.IMAP.test"></a>

#### IMAP.test(options) ⇒ <code>Promise</code>
Test IMAP connection

**Kind**: static method of <code>[IMAP](#module_emailtools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved on success and rejected on failure  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [#module_emailtools.IMAP.connect](#module_emailtools.IMAP.connect) to establish the connection with host |

<a name="module_emailtools.IMAP.getFolders"></a>

#### IMAP.getFolders(options) ⇒ <code>Promise</code>
Get whole folder structure for provided IMAP account. Format of the structure is defined bythe flags described below - If no flag is set returned format is a string array containingfolder identifiers.

**Kind**: static method of <code>[IMAP](#module_emailtools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with structure defined by the flags above  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [#module_emailtools.IMAP.connect](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.jstree | <code>boolean</code> | If true returned structure is compatible with a [jsTree](https://github.com/vakata/jstree) module |
| options.raw | <code>boolean</code> | If true returned as received from [node-imap](https://github.com/mscdex/node-imap) |

<a name="module_emailtools.IMAP.getLastMessagesHeaders"></a>

#### IMAP.getLastMessagesHeaders(options) ⇒ <code>Promise</code>
Get headers of latest messages of specified folder for provided account. Number of messagesis defined by the length flag.Seqno is used to sort emails not UID.

**Kind**: static method of <code>[IMAP](#module_emailtools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with dictionary where Sequence number is used as key and header object as value  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [#module_emailtools.IMAP.connect](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>string</code> | Valid folder name for given IMAP account |
| options.length | <code>int</code> | Number of messages returned |

<a name="module_emailtools.IMAP.readMessage"></a>

#### IMAP.readMessage(options) ⇒ <code>Promise</code>
Read and parse message specified by folder name and sequence number.

**Kind**: static method of <code>[IMAP](#module_emailtools.IMAP)</code>  
**Returns**: <code>Promise</code> - Resolved with [MailParser](https://github.com/andris9/mailparser) message object  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.connection | <code>Object</code> | Input options passed to [#module_emailtools.IMAP.connect](#module_emailtools.IMAP.connect) to establish the connection with host |
| options.folderName | <code>string</code> | Valid folder name for given IMAP account |
| options.messageSeqNo | <code>int</code> | Message sequence number with the folder |

