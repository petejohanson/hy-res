

before(function() {
  this.apiUrl = '/api';

  if (!this.document) {
    this.apiUrl = 'http://localhost:10000' + this.apiUrl;
  }
});
