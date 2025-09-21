# Learning Regex

## Why Try to Learn Regex Better
- One of my main uses of [ChatGPT](https://chat.openai.com/) is generating regex expressions. 
- This typically goes pretty well, though sometimes the generator misses on edge cases which are hard for me to think about when I am focused on just getting the Regex working
- I think it would be a lot faster for me tro just learn Regex and be able to quickly write simple expressions myself.
  - Most of the time, the regex expressions that I need to write are pretty simple, so I don't think I need to be a master at it.
- Parsing markdown (for converting from markdown to HTML) relies heavly on Regex pattern matching, so I wanted to learn this before completing the markdown to HTML functionality that I am working on with [markedjs](https://marked.js.org/)

## How I am Attempting to Learn Regex Better
- I am using [this youtube video](https://www.youtube.com/watch?v=saABx34CsBE) to learn regex better at first.
- I created an account on [regexr.com](https://regexr.com/) which I might use to save regex expressions, or I might just create a Table for it in the database

## Notes
- Regular expression goes /(PATTERN)/(FLAGS)
- A string is a regex, just an exact search regex, except in the case of the special characters seen below
```javascript 
  const a = /html/ // Regex searches for exact matches on html
```
- **Special (Meta) Characters**
  - *.*: Matches on a single instance of any characters
  - *\**: Look for zero or more instances of whatever the preceding regular expression is
```javascript 
  const a = /.*/ // Regex  matches every instance of all characters
```
  - *?*: For any pattern that is followed by a question mark, make the pattern option 
```javascript 
  const a = /<\/?html>/ // Regex matches opening and closing <html> tags
```
  = *|*: Means "OR" -> match the pattern before the pipe or after the pipe, where | = "pipe"
```javascript 
  const a = /<(h1|h2)>/ // Regex matches opening h1 or h2 tags
```
  - *+*: Look for one or more    
  - *()*: Called a **capture group** -> Allow us to create a sub regex and store whatever is captured in that sub regex in memory so that we can reference it later
    - Note that the **?:** in the below example prevents the capture group from being stored in memory
    - The **?<innerText>** in the below example names the capture group $innerText, whereas the capture groups are typically given names (references) 1, 2, and so on...
```javascript 
  const a = /<(?:h1|p)>(?<innerText>.*?)<\/(?:h1|p)>/ // Regex matches everything inside <h1> and <p> tags
```
  - *[]*: Called **Character Classes**: anything that falls within the bracket the regex will attempt to match on
    - *[^PATTERN]*: **Negated Character Class**: Matches anything except whatever is the *PATTERN*
```javascript 
  const a = /[\d\w]/ // Matches on any letter or digit
  const b = /[\d\w]+/ // Matches on any number of characters or digits
  const c = /[0-5]+/ // Matches on any number of instances of digits from 0 to 5
  const d = /[a-eX-Z]+/ // Matches on any number of instances of characters a-e or X, Y, and Z 
  const e = />[^<]+</ // Matches on everything between the right arrow and the left arrow
  const f = /(\A.*?)<a/ // matches all HTML up the first anchor tag
```
  - *-*: denotes range. See examples above of matching on a range of digits . a range of characters
  - *\\*: You can use \\index to reference previous matches of subgroups with **Back References**
    - In the example below, the **\1** is a reference to the subgroup **(\w{3}-)**
```javascript 
  const a = /(\w{3}-).*?\1/ // Look for three letters followed by a hyphen followed by three letters followed by a hyphen with any characters in between the two matches of the pattern - this first match will be the only match of the entire pattern.
```
- **Shorthands**
  - *\w*: matches on all letters 
  - *\d*: matches on all digits
  - *\s*: matches on all spaces
- **Anchors**
  - *^*: Denotes the start of a line
  - *$*: Denotes the end of a line
  - *\A*: Denotes the start of the entire text/document
    - *^* will match the start of every line in the document/text
  - *\Z*: Denotes the end of the entire text/document
- **Repetition / Range**
 - /\d{2}/ will match 2 consecutive digits
 - /a{2}/ will match two consecutive a's
 - /\d{3,5}/ will match numbers that are between 3 and 5 characters in length
  - Will match 123 and 12345, but **not** 12 or 1 or 123456
- **Flags**
  - *i*: case insensitive
  ```javascript
  const a = /[a-z]/gi; // Match all characters a-z (case insensitive)
  ```
  - *g* global
- **Search And Replace**
```javascript 
  const a = /(\w+)\s+(\w+)\s+(\w+)/ // Get the first three words
  /* $3 $2 $1 -> rearrange the first three words using capture groups */
```
- **Positive Look Ahead** - Find a regular expression that is immediately followed by another expression but only include the initial regular expression in the matching. The positive look ahead is denoted **?=** in the Regex expression below
```javascript 
  const a = /\w(?=\s)/ // Look for characters that are immediately followed by a space
```

- **Negative Look Around** - denoted by the **?!**
```javascript 
  const a = />(?!\s)/ // Look for a ">" character that is not immediately followed by a space
```
```javascript
  const a = /^(?!.*(?:html|body)).*?$/ // Matches all lines that do not contain the word HTML or body
```

#### Email Example
```javascript
const a = /^.*?@.*?\.\w+/ // (starts with and contains any characters)@(any letters).any characters
```
- **Javascript**
- javascript ```javascript "string".match()``` returns an array of matches  
- javascript ```javascript /\w+/.test("string")``` returns a boolean whether the string contains any matches of the regular expression
```javascript
var pattern = new RegExp(/\w+/,"gi");
var user = "Tim";
var pattern2  new RegExp("name: ".concat(user),"gi");
```
- **Python**
```python
import re
pattern = re.compile('[a-z]+')
pattern.findall("This is my test sentence") # -> ["his", "is", "my", "test", "sentence"]
pattern = re.compile('[a-zA-Z]+')
pattern.findall("This is my test sentence") # -> ["This", "is", "my", "test", "sentence"]

```