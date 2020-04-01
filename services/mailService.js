const
    nodemailer = require("nodemailer"),
    path = require("path"),
    fs = require("fs-extra"),
    sanitize = require("sanitize-filename"),
    {
        v4: uuidv4
    } = require("uuid"),
    {
        ImapFlow
    } = require("imapflow"),
    metadataService = require('../services/metadataService'),
    fileService = require('../services/fileService');

// config for receiving mails
const imapClient = new ImapFlow({
    host: process.env.MAIL_HOST,
    port: process.env.IMAP_PORT || "993",
    secure: process.env.IMAP_SECURE || "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

// config for sending mails
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE || true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

imapClient.on('exists', async () => {
    // fetch all messages
    let messages = await fetchAllMessages(),
        messagesToClean = [],
        messagesToDelete = [];
    for (let i = 0; i < messages.length; i++) {
        // check if messages hold attachments
        if (messages[i].bodyStructure.type == "multipart/mixed") {
            messagesToClean.push(messages[i]);
        } else {
            messagesToDelete.push(messages[i]);
        }
    }
    await Promise.all([cleanMessages(messagesToClean), await deleteMessages(messagesToDelete)])
});

const fetchAllMessages = async () => {
    // fetch all messages
    try {
        let messages = [];
        for await (let message of imapClient.fetch("1:*", {
            uid: true,
            envelope: true,
            bodyStructure: true
        })) {
            messages.push(message);
        }
        return messages;
    } catch (err) {
        throw new Error(err);
    }
}

const checkMimeType = async mimeType => {
    const allowedMimeTypes = ['image/.*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-.*', 'application/vnd.ms-.*'];
    let matches = [];
    for (let i = 0; i < allowedMimeTypes.length; i++) {
        let match = mimeType.match(allowedMimeTypes[i]);
        match ? matches.push(match) : null;
    }
    return matches.length > 0 ? true : false;
}

const cleanMessages = async messages => {
    // download messages with attachments
    try {
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i],
                files = [],
                unsupported = [];
            const sessionId = uuidv4();
            await fs.mkdirp(path.join(__dirname, "../", process.env.UPLOAD_PATH, sessionId));
            // download and save attachments of allowed file types
            for (let j = 0; j < message.bodyStructure.childNodes.length; j++) {
                let node = message.bodyStructure.childNodes[j];
                if (await checkMimeType(node.type)) {
                    let attachment = await imapClient.download(message.seq, node.part);
                    let filename = sanitize(attachment.meta.filename);
                    let stream = await fs.createWriteStream(path.join(__dirname, "../", process.env.UPLOAD_PATH, sessionId, filename));
                    await new Promise(resolve => {
                        attachment.content.pipe(stream);
                        stream.once('finish', () => {
                            resolve();
                        });
                    });
                    files.push(filename);
                } else if (node.type == "text/plain") {
                    continue;
                } else {
                    unsupported.push(node.type);
                    continue;
                }
            }
            if (files.length > 0 && unsupported.length == 0) {
                // only supported files were sent
                await metadataService.execExiftoolRemove(sessionId);
                await fileService.copyToDownload(sessionId);
                await sendMail(message.envelope.from[0].address, message.envelope.subject, sessionId, files);
            } else if (files.length > 0 && unsupported.length > 0) {
                // supported and unsupported files were sent
                await sendMail(message.envelope.from[0].address, `${message.envelope.subject} - Warning: Unsupported files sent ${unsupported.join(", ")}`, sessionId, files);
            } else {
                // only unsupported files were sent
                await sendFail(message.envelope.from[0].address, `${message.envelope.subject} - Error: Unsupported files sent ${unsupported.join(", ")}`);
            }
        }
        await deleteMessages(messages);
    } catch (err) {
        throw new Error(err);
    }
}

const deleteMessages = async messages => {
    try {
        for (let i = 0; i < messages.length; i++) {
            await imapClient.messageDelete(messages[i].seq);
        }
    } catch (err) {
        throw new Error(err);
    }
}

const openMailbox = async () => {
    // open mailbox and get lock
    await imapClient.connect();
    let lock = await imapClient.getMailboxLock("INBOX");
    try {
        // fetch all messages
        let messages = await fetchAllMessages(),
            messagesToClean = [],
            messagesToDelete = [];
        for (let i = 0; i < messages.length; i++) {
            // check if messages hold attachments
            if (messages[i].bodyStructure.type == "multipart/mixed") {
                messagesToClean.push(messages[i]);
            } else {
                messagesToDelete.push(messages[i]);
            }
        }
        // process messages
        await cleanMessages(messagesToClean);
        await deleteMessages(messagesToDelete);
    } catch (err) {
        throw new Error(err);
    } finally {
        lock.release();
    }
};

const sendMail = async (receiver, subject, sessionId, files) => {
    // prepare message
    const message = {
        from: process.env.MAIL_USER,
        to: receiver,
        subject: `metasquanch: ${subject}`,
        text: "Metadata has been removed...",
        attachments: []
    };
    // add attachments
    for (let i = 0; i < files.length; i++) {
        message.attachments.push({
            path: path.join(__dirname, "../", process.env.UPLOAD_PATH, sessionId, files[i])
        });
    }
    // send message
    transporter.sendMail(message);
}

const sendFail = async (receiver, subject) => {
    // prepare message
    const message = {
        from: process.env.MAIL_USER,
        to: receiver,
        subject: `metasquanch: ${subject}`,
        text: "Metadata could not be removed...",
    };
    // send message
    transporter.sendMail(message);
}

module.exports = {
    openMailbox
};