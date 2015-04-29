
Any operations, such as {@link WebLink#follow} or {@link
Resource#$followOne} that deference a URI, may need to first process a
[URI Template](http://tools.ietf.org/html/rfc6570) first to produce the
final URI to use.  In those cases, the values passed in the `data`
property of the `options` parameter will be used to process URI Template,
e.g.

For resource with the following link relation:

```json
  "_links": {
    "post": {
      "href": "/posts{/id}",
      "templated": true
    }
  }
```

You can follow the `post` link relation with the following:

```javascript
var postId = '123';
res.$followOne('post', { data: { id: postId } });
=> Resource { $resolved: false, $promise: $q promise, ... }
```

Or, if you access the link first, you can pass the data to the follow call there:

```javascript
var postId = '123';
var link = res.$link('post');
=> WebLink { href: '/posts{/id}', templated: true }
link.follow({ data: { id: postId } });
=> Resource { $resolved: false, $promise: $q promise, ... }
```

