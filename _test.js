const emailTools = require('./index');
emailTools.IMAP.appendMessage({
    connection: {
        user: 'admin@mfwi.com.au',
        password: 'CompAdmin216',
        host: 'aws1lcp11.webhosting.openconnect.com.au',
        port: 993,
        tls: true,
        debug: true
    },
    folderReadonly: false,
    folderName: 'INBOX.Sent',
    email: {
        from
    }
}).then(res=>{
    console.log(res);
    process.exit(0);
}).catch(err=>{
    console.error(err);
    process.exit(1);
});