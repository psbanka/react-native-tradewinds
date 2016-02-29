
## Introduction

There is a website that my sailing club provides which must have been written
ten or fifteen years ago that is a little difficult to use, but it's **especially bad** on my
iPhone. The purpose of this website is to reserve sailboats, and sometimes I
want to whip out my phone and reserve a boat right away. But then I think about
panning around the page and zooming in and out and trying to remember my
password (that it won't save!) and trying to deal with the twitchy and buggy
JavaScript controls. And I think: "Oh, I'll wait until I get home." 

##### The website using a desktop browser:

![Website-on-desktop](https://github.com/psbanka/react-native-tradewinds/blob/master/doc/tradewinds-tour-of-site-on-desktop.gif height="400")

##### The website using an iPhone:

![Website-on-iphone](https://github.com/psbanka/react-native-tradewinds/blob/master/doc/tradewinds-use-safari.gif height="300")

But that's a hassle. And anyway – **why do we accept that the performance on a
brand new mobile device is inferior to a ten-year-old windows PC running
Internet Explorer version 6?** I want a dedicated app on my phone which just
deals with showing and making reservations. Let me just tap on an app icon, see
my current reservations and five or six taps later, make a new one without ever
touching a browser.

If there is an app like this in your life, and if you are a self-respecting
JavaScript developer, there is no reason you can't have the experience you
want! There is a new breed of JavaScript frameworks (such as [React Native],
[NativeScript], and [Tabris.js]) which allow you to sit down and take that
lousy web app and make a simple, attractive, and easy-to-use **native** app
that provides just the interface that you want.

This blog post is going to focus on using React Native to accomplish this task,
but it could have been done just as easily using one of these other frameworks.

### But isn't what you're suggesting in this article stupid?

Yes, in some ways it is. Interfacing with a web app by pretending to be a
client is somewhat horrible. If you *own* or *manage* the website in question,
you should create a [jsonapi] interface for it instead of doing what I suggest
in this article.

But what if you don't own the website? Or what if the code is so gross and
horrible that you don't even want to think about touching it? In that case,
this is a perfectly reasonable approach, especially if that website isn't going
to change.

### Pre-requisites

This article is oriented towards building an iOS app using React Native. So
that means that you're going to have to run XCode, which means you're going to
have to be using a Mac. If you're not using a Mac, you can either develop an
Android app or use [Tabris.js]. Anyway, for the rest of the article, I'm just
going to go ahead and assume you've got a Mac because that's easier for me. 

First, you're going to want to install the following tools on your Mac:

- [homebrew] - for managing linux-like packages
- curl `brew install curl` (once you've installed homebrew) - for testing interaction with websites
- [betwixt] - for validating that your native app is working
- Google Chrome - for capturing traffic to the website you want to reverse-engineer

## Reverse-engineering the website using Chrome and cURL

#### 1. Capture an interaction with the website

The first step in building a native app replacement is to figure out exactly
how the web app works. For this, you're going to want to start with the Chrome
developer tools. If you're logged in to the web app, log out of it and begin by
looking at the login screen. 

Open the developer tools and log in to the app. Once you've made a successful
login attempt, go to the developer tools and find the HTTP request that was
responsible for you logging in successfully to the site (see screen-cap)

The successful login request will likely be a `POST` and will likely contain
some body information that has your username and password. In my case, the
login attempt was the very first call to the website to the URL:
`URL:http://www.tradewindssailing.com/wsdl/Logon-action.php` I can see from the
Chrome developer tools that the post contains my clear-text username and
password (over http, this is a pretty bad practice, but we already know this
website is old and lousy, and poor security shouldn't surprise us at this
point).

#### 2. Convert the website interaction to cURL

Next what I want to do is to capture this login attempt as a [cURL] command.
Why? Because `cURL` is a simple and succinct way to programmatically interact
with a website. `cURL` allows you to capture an interaction with a website and
quickly replay it, allowing you to verify that you have all the information you
need to produce the same kind of request from your React-Native app.

Luckily Chrome makes this **amazingly** easy. All you do is right-click on the
request which contains the interaction with the website and select `Copy as
cURL`. Then paste the resulting data into the nearest text-editor.

##### Screen-shot of capturing login attempt using Chome Devtools

![tradewinds-curl](https://github.com/psbanka/react-native-tradewinds/blob/master/doc/tradewinds-create-curl.gif "Tradewinds in browser")

When I did this, this is what I got:

```
curl 'http://www.tradewindssailing.com/wsdl/Logon-action.php' \
-H 'Cookie: userid=8637900; username=Peter+Banka; _gat=1; PHPSESSID=01cjast5kev4k98oqamhejrhg6; _ga=GA1.2.115674046.1452703527' \
-H 'Origin: http://www.tradewindssailing.com' -H 'Accept-Encoding: gzip, deflate'
-H 'Accept-Language: en-US,en;q=0.8' \ -H 'Upgrade-Insecure-Requests: 1' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' \
-H 'Cache-Control: max-age=0' -H 'Referer: http://www.tradewindssailing.com/wsdl/Logon.php' \
-H 'Connection: keep-alive'
--data 'userid=8637900&pwd=4zBDkV1Agi&Submit=Submit' --compressed
```

#### 3. Trying out the curl command

You should feel free to experiment with your curl command on the command-line.
Open up a terminal. Paste that sucker in. See what it does!

> **NOTE** Use your own curl commands that you got from **your own** website.
> Don't try to use the examples that I provided above. They contain bogus
> credentials, and they will not work for you. While they are based on a real
> use-case, I don't want to publish my personal credentials for an online
> website on the Internet, so I have modified them. They are provided as
> examples only!

When I paste that thing into a terminal, I get the following:

```
<html></html>
```

Which is somewhat disappointing :( . Did it work? How do we know?

In order to get better results out of curl, you're usually going to want to
focus on the **headers** and not the actual response html. To do this, add the
`-v` flag to the end of your curl command. When you do this, you'll get
something like the following:

```
*   Trying 198.171.78.101...
* Connected to www.tradewindssailing.com (198.171.78.101) port 80 (#0)
> POST /wsdl/Logon-action.php HTTP/1.1
> Host: www.tradewindssailing.com
> Cookie: userid=8637900; username=Peter+Banka; _gat=1; PHPSESSID=01cjast5kev4k98oqamhejrhg6; _ga=GA1.2.115674046.1452703527
> Origin: http://www.tradewindssailing.com
> Accept-Encoding: gzip, deflate
> Accept-Language: en-US,en;q=0.8
> Upgrade-Insecure-Requests: 1
> User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36
> Content-Type: application/x-www-form-urlencoded
> Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
> Cache-Control: max-age=0
> Referer: http://www.tradewindssailing.com/wsdl/Logon.php
> Connection: keep-alive
> Content-Length: 43
>
* upload completely sent off: 43 out of 43 bytes
< HTTP/1.1 302 Moved Temporarily
< Date: Tue, 23 Feb 2016 04:32:17 GMT
< Server: Apache
< X-Powered-By: PHP/5.4.23
< Expires: Thu, 19 Nov 1981 08:52:00 GMT
< Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
< Pragma: no-cache
< Set-Cookie: userid=8637900; expires=Mon, 23-May-2016 04:32:17 GMT
< Set-Cookie: username=Peter+Banka; expires=Mon, 23-May-2016 04:32:17 GMT
< Location: Reservations.php
< Keep-Alive: timeout=5, max=100
< Connection: Keep-Alive
< Transfer-Encoding: chunked
< Content-Type: text/html
<
```

There are a few clues here that this command resulted in a successful login
attempt:
- the line `HTTP/1.1 302 Moved Temporarily` tells us that the website wants us
  to go to a new location, and
- the line `< Location: Reservations.php` tells us that it wants us to go look
  at the reservations page. If the website had told us to go back to the
  `Logon.php` location, that would be a pretty-good indication that our attempt
  did *not* work.
- The line `< Set-Cookie: userid=8637900; expires=Mon, 23-May-2016 04:32:17
  GMT` tells us that the website is trying to set cookies on our browser. This
  typically means that the website trusts us and wants our browser to identify
  itself as our proper user self in the future.

These all indicate that the website probably accepts the request that we made
and that we are in.

#### 4. Experiment with the curl command

When you look at that command that you pasted in, there's a lot of stuff there,
and probably much of it you don't need. We should pull it apart and understand
what parts of it are absolutely necessary and what parts can be dispensed with. 

here's the curl command again for reference:

```
curl 'http://www.tradewindssailing.com/wsdl/Logon-action.php' \
-H 'Cookie: userid=8637900; username=Peter+Banka; _gat=1; PHPSESSID=01cjast5kev4k98oqamhejrhg6; _ga=GA1.2.115674046.1452703527' \
-H 'Origin: http://www.tradewindssailing.com' -H 'Accept-Encoding: gzip, deflate'
-H 'Accept-Language: en-US,en;q=0.8' \ -H 'Upgrade-Insecure-Requests: 1' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' \
-H 'Cache-Control: max-age=0' -H 'Referer: http://www.tradewindssailing.com/wsdl/Logon.php' \
-H 'Connection: keep-alive'
--data 'userid=8637900&pwd=4zBDkV1Agi&Submit=Submit' --compressed
```

For each `-H` flag, curl is setting a header. Let's experiment with getting rid
of these and see which ones are really necessary.

It turns out that we can pare this command down to the following: 

```
curl 'http://www.tradewindssailing.com/wsdl/Logon-action.php' --data 'userid=8637900&pwd=4zBDkV1Agi&Submit=Submit' -v
```

This is good, because we're going to be converting this call to a `fetch` call
later, and the less we have to convert, the better. 

### Converting the cURL calls to `fetch`

So now we have a simple call to a website. I know that my userid is `8637900`,
and I know that my password is `4zBDkV1Agi`, so I feel confident that I can
create a curl request for anyone's username and password. Now I need to convert
this request to something that can be used in React Native. 

If you'd like to see an example of how this curl call is converted to
React-Native, it can be seen in this [converted curl call].

Essentially it boils down to the following:

```javascript
funciton logIn(userData) {
  const params = {  
    method: 'POST',
    body: `userid=${userData.username}&pwd=${userData.password}&Submit=Submit`,
  }

  return fetch('http://www.tradewindssailing.com/wsdl/Logon-action.php', params)
    .then(logonResponse => {
      if (logonResponse.url === 'http://www.tradewindssailing.com/wsdl/Logon.php') {
        console.log('Bad username or password'})
      } else {
        console.log('You are totally logged in right now')
      }
      return fetch('http://www.tradewindssailing.com/wsdl/Reservations.php')
    .catch(error => {
      console.log('something went terribly wrong');
    })
```

You're seeing here the new [fetch api] in action. It's built into React Native
and it works very well.

### Dealing with cookies

You probably already understand cookies and web authentication, but for those
of you who do not, here is a quick primer: when the web server wants to keep
track of a user, the server sends an instruction for the browser to set a
cookie. The browser is then required to send that cookie whenever it sends a
request to the server until the server tells it to stop.

Often a server will send an instruction to the browser to keep track of a
session-id. So, when curl tells you that the response from the web server
contains a line like the following:

```
< Set-Cookie: PHPSESSID=taamci2tit4j4thoaq8sqnvl24; path=/
```

that tells you that your browser needs to set a session-id cookie which will
identify your session with that server from now on. If you log in to the server
but fail to send that cookie with every request, then the server will not
recognize that you have logged in and will treat any further requests from your
React Native app as coming from an un-authenticated user.

When using a program like curl, you tend to expect cookies to come in through
headers and to be set with headers. However, this is not how cookies work on
the React-Native platform!

Instead, there is an npm module called `react-native-cookies` which examines
fetch requests and responses and manages cookies for you.

To retrieve the cookie from the last `fetch` API call, you'll use
`CookieManager.getAll()`. Then to ensure that `fetch` uses your new cookie for
every future message to that server, you'll use `CookieManager.set()` as shown
here:
https://github.com/psbanka/react-native-tradewinds/blob/master/actions/tradewindsActions.js#L161

```
        CookieManager.getAll((cookies, status) => {
          const newCookie = {
            name: 'PHPSESSID',
            value: cookies.PHPSESSID.value,
            domain: 'www.tradewindssailing.com',
            origin: 'www.tradewindssailing.com',
            path: '/',
            version: '1',
            expiration: '2016-05-30T12:30:00.00-05:00'
          }
          CookieManager.set(newCookie, (err, res) => {
            if (!err) {
              console.log('cookie set!')
            }
          })
        });
```

### Debugging your React-Native app using Betwixt

Converting `curl` calls to `fetch` calls, while fairly straightforward, can
still be problematic: did you get your cookies set properly? Did you get your
data formatted properly in the POST? How exactly did the server respond?

Answering questions like this on the React Native platform can be difficult
because you can't use the Chrome Debugger tools to capture your fetch traffic
like you can when using a browser. Therefore you can be flying blind when
trying to determine exactly what your web requests and responses look like that
are coming from your React-Native app.

Luckily, there is a new project called [betwixt] which provies all the Chrome
Developer tools for you to analyze *all* calls coming to and from your Mac.
And, since your iOS simulator on your Mac is just another Mac application, you
can see all network calls coming from your React Native application and see
exactly how they compare to the ones that you captured in the beginning of your
reverse-engineering session.

Here is an example of a betwixt session in-action, where we can see and inspect
the calls being made by the fetch API from the React Native system on the iOS
simulator:

##### Debugging using Betwixt

![using-fetch](https://github.com/psbanka/react-native-tradewinds/blob/master/doc/tradewinds-use-betwixt.gif "debugging using betwixt")

### The final product

When finished, you should be able to have a simple, effective, and intuitive
app which runs on your phone that uses the web app as a backend. You may decide
to send this out to the app store, or you may just decide that you want to use
it for yourself only. Either way, you have proven that you can make something
simple and useful for yourself and that you don't have to be at the mercy of
lousy web apps on your phone any longer!

Here is an example of the final running iPhone app:

![final-app](https://github.com/psbanka/react-native-tradewinds/blob/master/doc/tradewinds-app "final app")

   [React Native]: <https://facebook.github.io/react-native/>
   [NativeScript]: <https://www.nativescript.org/>
   [Tabris.js]: <https://tabrisjs.com/>
   [cURL]: <https://curl.haxx.se/>
   [homebrew]: <http://brew.sh/>
   [betwixt]: <https://github.com/kdzwinel/betwixt/blob/master/README.md>
   [jsonapi]: <http://jsonapi.org/>
   [fetch api]: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API>
   [converted curl call]: <https://github.com/psbanka/react-native-tradewinds/blob/master/actions/tradewindsActions.js#L109>
