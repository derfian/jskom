'use strict';

mocha.setup('tdd')
var assert = chai.assert;

suite('htmlFormattingService', function() {
  beforeEach(module('jskom.services'));
  
  var service;
  beforeEach(inject(function(htmlFormattingService) {
    service = htmlFormattingService;
  }));
  
  suite('#formatBody()', function() {
    test('should linkify url', function() {
      var url = 'http://jskom.osd.se/some/thing?baz=foo%20bar(barbapappa)';
      
      assert.equal(service.formatBody(url),
                   '<a target="_blank" href="' + url + '">' + url + '</a>');
    });
    
    test('should not include surrounding brackets or parentheses', function() {
      var url = 'http://jskom.osd.se/?baz=foo%20bar(barbapappa)';
      
      assert.equal(service.formatBody('[' + url + ']'),
                   '[<a target="_blank" href="' + url + '">' + url + '</a>]');
      
      assert.equal(service.formatBody('(' + url + ')'),
                   '(<a target="_blank" href="' + url + '">' + url + '</a>)');
      
      assert.equal(service.formatBody('<' + url + '>'),
                   '&lt;<a target="_blank" href="' + url + '">' + url + '</a>&gt;');
    });
    
    test('should not include url: prefix in brackets', function() {
      var url = 'http://jskom.osd.se/?baz=foo%20bar(barbapappa)';
      
      assert.equal(service.formatBody('<url:' + url + '>'),
                   '<a target="_blank" href="' + url + '">&lt;url:' + url + '&gt;</a>');

      assert.equal(service.formatBody('<url: ' + url + ' >'),
                   '<a target="_blank" href="' + url + '">&lt;url: ' + url + ' &gt;</a>');
      
      assert.equal(service.formatBody('<URL:' + url + '>'),
                   '<a target="_blank" href="' + url + '">&lt;URL:' + url + '&gt;</a>');
    });
    
    test('should linkify text number', function() {
      assert.equal(service.formatBody('123'), '123');
      
      assert.equal(service.formatBody('1234'),
                   '<jskom:a text-no="1234">1234</jskom:a>');
      
      assert.equal(service.formatBody('a text number 1287624 in some text'),
                   'a text number <jskom:a text-no="1287624">1287624</jskom:a> in some text');
    });
    
    test('should linkify lyskom conf link', function() {
      assert.equal(service.formatBody('<möte12345>'), '&lt;möte12345&gt;');
      
      assert.equal(service.formatBody('<möte 67890>'),
                   '<a href="/conferences/67890">&lt;möte 67890&gt;</a>');
      
      assert.equal(service.formatBody('<möte 6: Inlägg }t mig>'),
                   '<a href="/conferences/6">&lt;möte 6: Inlägg }t mig&gt;</a>');

      assert.equal(service.formatBody('<person  14506>'),
                   '<a href="/conferences/14506">&lt;person  14506&gt;</a>');
      
      assert.equal(service.formatBody('<person 14506: Oskars Testperson>'),
                   '<a href="/conferences/14506">&lt;person 14506: Oskars Testperson&gt;</a>');
    });
    
    test('should linkify lyskom text link', function() {
      assert.equal(service.formatBody('<text12345>'), '&lt;text12345&gt;');
      
      assert.equal(service.formatBody('<text  1234567>'),
                   '<jskom:a text-no="1234567">&lt;text  1234567&gt;</jskom:a>');
      
      assert.equal(service.formatBody('<text 4711: lite text>'),
                   '<jskom:a text-no="4711">&lt;text 4711: lite text&gt;</jskom:a>');
      
      // This test shows that a line feed character inside a lyskom
      // <text ..> tag will remain a line feed, and not be replaced by
      // a <br> tag. This is because we don't handle nested tags.
      assert.equal(service.formatBody('Man trycker C-c C-i C-l (tänk på det som "insert link" eller "infoga\nlänk") och svarar på frågorna. Eller så skriver man <text 4711: en\ntegelsten>.'),
                   'Man trycker C-c C-i C-l (tänk på det som &quot;insert link&quot; eller &quot;infoga<br/>länk&quot;) och svarar på frågorna. Eller så skriver man <jskom:a text-no="4711">&lt;text 4711: en\ntegelsten&gt;</jskom:a>.');
      
      // This test shows that a <text ...> tag cannot contain other
      // tags (i.e. you can't nest tags).
      assert.equal(service.formatBody('<text 19914766: Hej>. <text 19914766: Hej då> ' +
                                      '<text 19914766>'),
                   '<jskom:a text-no="19914766">&lt;text 19914766: Hej&gt;</jskom:a>. ' + 
                   '<jskom:a text-no="19914766">&lt;text 19914766: Hej då&gt;</jskom:a> ' + 
                   '<jskom:a text-no="19914766">&lt;text 19914766&gt;</jskom:a>');
    });
    
    test('should replace newlines with br tags', function() {
      assert.equal(service.formatBody('\n'), '<br/>');
      assert.equal(service.formatBody('\n\n'), '<br/><br/>');
      assert.equal(service.formatBody('\r\n'), '<br/>');
      assert.equal(service.formatBody('\n\r'), '<br/><br/>');
      assert.equal(service.formatBody('\r\n\n'), '<br/><br/>');
      assert.equal(service.formatBody('\r\n\r\n'), '<br/><br/>');
    });
    
    test('should escape html', function() {
      assert.equal(service.formatBody('&'), '&amp;');
      assert.equal(service.formatBody('<script>'), '&lt;script&gt;');
      assert.equal(service.formatBody('<script>alert("hej");</script>'),
                   '&lt;script&gt;alert(&quot;hej&quot;);&lt;/script&gt;');
    });
    
    test('should handle urls that are part of other urls', function() {
      var text = 'http://google.com\n and another url http://google.com/foo/bar';
      
      assert.equal(service.formatBody(text),
                   '<a target="_blank" href="http://google.com">http://google.com</a>' +
                   '<br/> and another url <a target="_blank" href="http://google.com/foo/bar">' +
                   'http://google.com/foo/bar</a>');
    })
  });
});
