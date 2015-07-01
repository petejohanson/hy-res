# hy-res [![Build Status](https://travis-ci.org/petejohanson/hy-res.svg?branch=master)](https://travis-ci.org/petejohanson/hy-res) [![codecov.io](http://codecov.io/github/petejohanson/hy-res/coverage.svg?branch=master)](http://codecov.io/github/petejohanson/hy-res?branch=master)

A hypermedia client/library supporting several media formats. [HAL](http://tools.ietf.org/html/draft-kelly-json-hal-06), [Siren](https://github.com/kevinswiber/siren), and [Link header](https://tools.ietf.org/html/rfc5988) extensions are included by default, but support for other media types can be added. For the most part, the core library is not normally used directly, instead consumed by way of a small framework integration layer, e.g. [angular-hy-res](http://github.com/petejohanson/angular-hy-res).

## Support

For any questions, please post to the [HyRes Google Group](https://groups.google.com/forum/#!forum/hy-res).

For release announcements and updates, you can also follow [@petejohanson](https://twitter.com/petejohanson):

<a href="https://twitter.com/petejohanson" class="twitter-follow-button" data-show-count="false">Follow @petejohanson</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>

## Installation

### NPM

hy-res is available via NPM. To install:

    $ npm install --save hy-res

_Note: The API is still evolving, so during the 0.0.x series of releases there are no API stability guarantees Those users needed a stable API should set an explicit version in package.json_

## Documentation

hy-res is inspired by AngularJS' `$resource` service that focuses on using hypermedia
controls, links (and/or embedded resources) discovered by link relation, to traverse a hypermedia enabled API.
hy-res itself is not dependant on AngularJS, and can be used standalone along w/ the [axios](https://www.npmjs.com/package/axios)
library. For deep AngularJS integration, leveraging the `$http` service, use the [angular-hy-res](https://github.com/petejohanson/angular-hy-res)
wrapper library.

For details, see refer to the [API documentation](http://petejohanson.github.io/hy-res/).

## Examples

A complete working example can be found at [angular-hy-res-example](https://github.com/petejohanson/angular-hy-res-example),
which demonstrates the below pagination concept. A public copy is deployed to Heroku at:

[https://angular-hy-res-example.herokuapp.com/](https://angular-hy-res-example.herokuapp.com/)

For example, given a HAL collection resource that uses the standard link relations `next` and `prev` to control
paging through the collection, and the `item` relation for each item in the collection, here is a sample response:

```json
{
    "_links": {
        "self": { "href": "/page/2" },
        "next": { "href": "/page/3" },
        "prev": { "href": "/page/1" }
    }
    "_embedded": {
        "item": [
          {
            "_links": { "self": { "href": "/posts/123" } },
            "title": "MY blog post",
            "tags": [ "blogging", "hypermedia" ]
          }
        ]
    }
}
```

Then the controller can easily be:

```javascript
angular.module('angularHyResDocs')
  .controller('ahrdPageCtrl', function(root) {
    $scope.page = root.$followOne('http://api.myserver.com/rel/posts');
    $scope.posts = $scope.page.$followAll('item');
    
    var follow = function(rel) {
      $scope.page = $scope.page.$followOne(rel);
      $scope.posts = $scope.page.$followAll('item');
    };
    
    $scope.next = function() {
      if (!$scope.hasNext()) {
        return;
      }
      
      follow('next');
    };
    
    $scope.prev = function() {
      if (!$scope.hasPrev()) {
        return;
      }
      
      follow('prev');
    };
    
    $scope.hasNext = function() {
      return $scope.page.$has('next');
    };
    
    $scope.hasPrev = function() {
      return $scope.page.$has('prev');
    };
  });
```

And the view:

```html
<div>
  <ul class="pagination">
    <li>
      <a ng-click="{{prev()}}" ng-class="{disabled: !hasPrev()}">&laquo;</a>
    </li>
    <li>
      <a ng-click="{{next()}}" ng-class="{disabled: !hasNext()}">&raquo;</a>
    </li>
  </ul>
  <ul>
    <li ng-repeat="post in posts">{{post.title}}</li>
  </ul>
</div>
```

## To Do

* Submit form file uploads? Maybe allow consumers to provide populated FormData
  instance in `submit` parameters?
* Handle scenario where subset of links for a given link relation is embedded.
  For this scenario, we should really return a mix of resolved embedded
  resources and unresolved resources that result from following the non-embedded
  links.
* Extensions for other media types (e.g. Collection+Json, Uber)
* Support URI schemes other than http/https (extension mechanism?)
* Mixins for resources based on... profile? link relation that was followed?
* Differentiate between embedded link vs embedded representation (See Siren spec)
* Handling or error types, e.g. application/problem+json
* Store resource's own URL somewhere accessible, perhaps `res.$href`?
* Store raw http response data in resource property, e.g. `res.$raw`
* Support for PUT of modified resource to replace server state?
