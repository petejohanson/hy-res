
Hypermedia forms come in many varieties/flavors, but fundamentally, they consiste of two core set of information: the metadata about the form itself, e.g. URL/URI Template to use for completing the form request, or the content type, if any to encode the request in, and the set of field metadata fo the various inputs for th form.

For tue most part, the only high level metadata tyat consumers may need is a title for display. Otherwise, the primary piece that consumers need do is manipulate the field valuea before submitting the form.

## Example

The following Siren example demonstrates using a hypermedia form to perform a request.

### Form Resource

Imagine a ToDo list API. The resource for loading the liat items might also include the form for adding a new item:

```http
HTTP/1.1 GET /items
Host: http://todo.io/

{
  "entities": [
    // The ToDo liat items
  ]
  "actions": [
    {
      "name": "create-item",
      "href": "/items",
      "method": "POST",
      "title": "Add Item",
      "fields": [
        { "name": "item", "type": "text" }
      ]
    } 
  ]
}
```
Assuming that `res` is a {@link Resource} instance for `/itens`, we can do the following:

```javascript
var form = res.$form('create-item'); // Get a copy of the form
form.field('item').value = 'Wash the dishes'; // Update field values.
var newItemRes = form.submit(); // Make the HTTP request
```

The call to {@link Form#submit} will perform a request like the following:

```http
HTTP/1.1 POST /items
Host: http://todo.io/
Content-Type: application/x-www-form-urlencoded

item=Wash%20the%20dishes
```
