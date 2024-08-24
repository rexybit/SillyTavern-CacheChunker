# Cache Chunker

If you naively trim the oldest messages from context, you'll have to rebuild the cache every message once you hit the context limit. This extension instead trims N messages at a time, so you only have to rebuild the cache every N messages. This won't work in group chats and neither if you use automatic summery creation, as these features cause the beginning of the context to change. You sacrifice being able to include as much messages as possible in the context, to gain improved inference speed. If you're able to run 32k Context length, you can get reasonably get away with only reevaluating the whole context every 15 messages or so, or even less frequently, depending on how much context length you are willing to sacrifice. 

## Install
git clone into your extension directory of ST, e.g. "data\default-user\extensions".

You can also download this repository as zip and paste the contents under e.g."data\default-user\extensions\SillyTavern-CacheChunker"

## Configuration

There are two settings you can configure for this extension:

- Chunk Size: The number of messages to trim at a time. This isn't an exact number, e.g. larger than average messages cause the context to be chunked sooner. Note that one turn (user - assistant) consists of two messages.
- Max Message History Context: This is the maximum length of the messages part of the context. This should be roughly `max context length - (everything else, character card length, world info, authors note etc`. If you see the context still be revaluated every time, try setting this lower.

## Common Errors
#### Error: settings.html not found
This means that the folder name of this plugin under the extensions dir isn't correct. The Folder has to have the same name as the variable `MODULE_NAME` in `index.js`. You can change either one.

## Console output
This script dumps some Info into the console on each prompt send to the LLM backend:

- Trimming context, message count before: x
    - Number of Messages in the whole chat
- Cache circa filled: x out of N 
    - Indication on when the next whole context evaluation will happen, the closer x is to N, the more likely it is that the next message will cause a complete context reevaluation 
- Cut messages up to: y
    - How many messages, starting from the beginning of the chat, are not included in the context
- Trimming context; message count / context length are now: z / a
    - z Messages are part of the context, these have a approximated length of a tokens

## Disclaimer
This is a fork of https://github.com/Omegastick/SillyTavern-CacheChunker

Original credit goes to Omegastick.
I've improved the Context chunking calculation so that the configured parameters are easier to dial in, to reduce the execution cost of the script and to improve the experience with instruct mode. Also i've expanded the documentation a bit
