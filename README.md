TypeScript to Haxe Convertor
===========================
This script help converting TypeScript code to haxe.
it's not a compiler it only automate common conversion tasks allowing you to easily target multiple platforms from your TS code (via haxe multi-platform support)

Usage
---------------------

'''
node ts2haxe MyClass.ts MyClass.hx
'''

What's implemented
------------------

* Types conversion (bool => Bool, any => Dynamic ...etc)
* convert TypeScript module encapsulation to Haxe package header
* class variables
* constructors
* functions
* unfold for loops to while loops since haxe does not support JS for loop syntax


TODO LIST
---------

* convert setTimer/setInterval syntax to Timer/Timer.delay.
* add tests and samples

feel free to post new features request in [Issue Tracker][1] .


Help to improve ts2haxe
-----------------------

to help improving this script please report any issue with tast cases to the [Issue Tracker][1] .
you are also welcome to fork and make pull requests to enhance/fix ts2haxe


License
-------

//   MIT License
//   Copyright(c) 2013 Ezelia.com and other contributors
//   Author : Alaa-eddine KADDOURI 
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of 
// this software and associated documentation files(the 'Software'), to deal in the 
// Software without restriction, including without limitation the rights to use, 
// copy, modify, merge, publish, distribute, sublicense, and / or sell copies of 
// the Software, and to permit persons to whom the Software is furnished to do so, 
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING  BUT NOT LIMITED  TO THE WARRANTIES  OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE 
// AUTHORS  OR COPYRIGHT HOLDERS BE LIABLE  FOR  ANY CLAIM,  DAMAGES OR OTHER 
// LIABILITY,  WHETHER IN AN ACTION OF CONTRACT,  TORT OR OTHERWISE,  ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
// IN THE SOFTWARE.