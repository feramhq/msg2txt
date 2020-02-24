# Msg2txt

Converts an Outlook `.msg` file to a directory containing the email header +
body as a text file and all attachments simply as the files.


## Usage

```sh
node index.js email.msg
```

Or build a standalone binary, which can easily be used on systems
without node.js installed.

**MacOS:**

```sh
npx pkg \
  --targets node12-macos-x64 \
  --output msg2txt \
  index.js
```

Creates a `msg2txt` binary which can be called like `./msg2txt email.msg`.


**Windows:**

```sh
npx pkg \
  --targets node12-win-x64 \
  --output msg2txt \
  index.js
```

Creates a `msg2txt` binary which can be called like `./msg2txt email.msg`.


It's possible to change the language to German by changing the `lang`
constant in `index.js` to `de`.
