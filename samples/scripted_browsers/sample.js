require('new-relic-synthetics-manager');
//----- Add synthetic code below this line

var By = $driver.By;
var assert = require('assert');

$browser.get("https://github.com/yodle/new-relic-synthetics-manager");

$browser.waitForAndFindElement(By.css('#readme h1')).then(function(element) {
  return element.getText().then(function(text) {
    assert.equal(text, 'New Relic Synthetics Manager');
  });
});