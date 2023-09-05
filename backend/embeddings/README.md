# Error Grouping using LLM Embeddings

This a simple demo of some of the error / embedding logic that we’re working on at highlight.io. 
To visit the demo, see [our app here](https://app.highlight.io/error-tags).

Our goal was to build two features: (1) tagging errors (e.g. deeming an error as “authentication error” or a “database error”); 
and (2) grouping similar errors together (e.g. two errors that have a different stacktrace and body, but are semantically not very different).

Our general approach for classifying/comparing text is as follows. 
As each set of tokens (i.e a string) comes in, our backend makes a request to an inference endpoint 
and receives a 1024-dimension float vector as a response. 
We then store that vector using pgvector. To compare any two sets for similarity, 
we simply look at the Euclidian distance between their respective embeddings 
using the ivfflat index implemented by pgvector.

See the full post [on hacker news here](https://dub.sh/k15UyXW).

# Demo

Visit https://app.highlight.io/error-tags
