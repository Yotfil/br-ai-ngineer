import type { EnTopic } from './migrate-rest.ts'

/**
 * Traducción al inglés de la prosa de los 20 temas (tarea 7.6). El código de los ejemplos no se traduce:
 * el script lo copia de la guía para que sea idéntico en ambos idiomas.
 * `ex[i].o` solo se da cuando las opciones son texto; si no, se reutilizan las originales.
 */
export const REST_EN: EnTopic[] = [
  // 1
  {
    title: 'What happens when you type a URL and press Enter',
    summary: 'The browser resolves the domain (DNS), opens a connection (TCP), encrypts it (TLS), sends the HTTP request and gets the response.',
    def: 'The browser resolves the domain name to an IP (DNS), opens a reliable connection with that server (TCP), encrypts it (TLS), sends the HTTP request and receives the response, which it then interprets and renders.',
    ana: 'It is like sending a registered letter to a company: first you look up its address in the directory (**DNS**), then the courier confirms someone can receive it (**TCP**), you put it in a sealed envelope only they can open (**TLS**), and finally your letter goes out (**request**) and they send another one back (**response**).',
    prob: 'Understanding the whole journey lets you diagnose which layer is failing: a DNS error is not a 500, an expired certificate is not a bug in your endpoint, and a timeout can happen before your code even runs.',
    bridge:
      'In the **Network** tab, the **Timing** view of each request shows these phases: `DNS Lookup`, `Initial connection` (TCP), `SSL` (TLS), `Waiting for server response` (how long your backend takes, the TTFB) and `Content Download`. When a request is slow in a project, that breakdown tells you whether the culprit is the network or the server.',
    ans: 'First the browser checks its caches and, if it does not have the IP, makes a DNS query. With the IP it opens a TCP connection with the three-way handshake and, since it is HTTPS, negotiates TLS: the server presents its certificate and they agree on encryption keys. Over that channel it sends the HTTP request with method, path and headers. On the server side there is usually a load balancer or proxy that forwards it to the application; the app processes it, maybe queries the database, and returns a response with a status code, headers and body. Finally the browser interprets it and, if it is HTML, requests the additional resources and renders.',
    myths: [
      'Thinking the backend receives the request exactly as it left the browser. In between there is usually a CDN, a load balancer and a reverse proxy that add or remove headers (for example `X-Forwarded-For`).',
      'Believing every request repeats DNS, TCP and TLS. DNS is cached and connections are reused (keep-alive).',
      'Mixing up the port: HTTP uses 80 and HTTPS 443 by default, even if the URL does not show it.',
    ],
  },
  // 2
  {
    title: 'Anatomy of a request and a response',
    summary: 'An HTTP message has a start line, headers, a blank line and an optional body.',
    def: 'An HTTP message has three parts: a start line (in the request: method, path and version; in the response: version, status code and status text), a block of `Name: value` headers, a blank line and an optional body.',
    ana: 'A courier parcel: the **label** says who it goes to and what kind of shipment it is (start line), the **sticky notes** add instructions like "fragile" or "contains liquids" (headers), and the **box** carries the contents (body).',
    prob: 'If you do not respect the structure (for example, you send JSON without `Content-Type: application/json`), the server does not know how to interpret the body and responds 415 or 422. Headers are the standard way to send metadata; putting them in the body or the URL breaks intermediate tools such as caches and proxies.',
    bridge:
      'When you write `fetch(url, { method: "POST", headers, body: JSON.stringify(data) })`, you build exactly this structure: the method and the URL go in the start line, the parameters you add to the URL with `URLSearchParams` go in the query string, `headers` go in the header block, and the body travels as the JSON text you serialized. Your own function that wraps `fetch` only adds one more line to the header block.',
    ans: 'An HTTP request has a start line with the method, the path with its query string and the protocol version; then come the headers, which are key-value metadata such as Content-Type, Accept or Authorization; then a blank line and the optional body. The response has the same structure, except the start line carries the version, the status code and its text. That way the server knows what is being asked, in what format and with which credentials, and the client knows whether it went well and how to read what it receives.',
    myths: [
      'Believing GET cannot have headers or that only POST has a body. GET always has headers; what it should not carry is a body with meaning.',
      'Thinking header names are case-sensitive. `content-type` and `Content-Type` are the same header (in HTTP/2 they travel in lowercase).',
      'Forgetting the blank line: it is what separates the headers from the body.',
    ],
  },
  // 3
  {
    title: 'Anatomy of a URL',
    summary: 'A URL identifies a resource and where to find it: scheme, host, port, path, query and fragment.',
    def: 'A URL identifies a resource and where to find it: `scheme://host:port/path?query#fragment`. The fragment never travels to the server; everything else does.',
    ana: 'A full postal address: the **scheme** is the delivery method (regular or registered mail), the **host** is the building, the **port** the service window, the **path** the apartment, the **query** the extra instructions ("deliver only in the morning") and the **fragment** a note you use when you arrive, but the mail carrier never reads.',
    prob: 'Knowing which part to use defines your API design: the **path** identifies the resource (`/productos/42`) and the **query** filters it or changes the view (`?categoria=cafe`). If you mix up their roles you end up with paths like `/productos/categoria/cafe/orden/precio`, impossible to combine.',
    bridge:
      'The fragment is exactly what SPA routers used in hash mode (`/#/pedidos`): since the server never sees it, it always served the same `index.html`. With normal routes (the router of an SPA) the server does receive `/pedidos`, and that is why you have to configure it to return `index.html` for any route.',
    ans: 'A URL has a scheme, which indicates the protocol; a host, which is the domain; a port, which if omitted is 80 for HTTP or 443 for HTTPS; a path, which identifies the resource; a query string, with key-value parameters to filter or paginate; and a fragment, which only the browser uses and is never sent to the server. In REST design, the path identifies the resource and the query modifies the view of the collection.',
    myths: [
      'Putting sensitive data in the query string: it ends up in server logs, proxy logs and browser history, even if you use HTTPS.',
      'Believing the fragment reaches the backend.',
      'Forgetting to encode special characters: a space travels as `%20` and ñ as `%C3%B1`.',
    ],
  },
  // 4
  {
    title: 'HTTP methods and PUT vs. PATCH',
    summary: 'The method states the intent of the request on the resource: read, create, replace, modify, delete, ask for headers or query options.',
    def: 'The method states the intent of the request on the resource: read (GET), create or process (POST), replace (PUT), partially modify (PATCH), delete (DELETE), ask only for the headers (HEAD) or query what is allowed (OPTIONS).',
    ana: 'A customer card in a filing cabinet: **GET** is reading it, **POST** is handing in a new card so the archive assigns it a number, **PUT** is swapping the whole card for another, **PATCH** is correcting only the phone number with correction fluid, **DELETE** is removing it, **HEAD** is asking whether it exists and when it was modified without taking it out, and **OPTIONS** is asking what you are allowed to do with it.',
    prob: 'Methods tell the whole infrastructure what it can do with the request: caches only store GET, clients automatically retry idempotent ones, and browsers send a preflight depending on the method. Using POST for everything makes you lose caching, safe retries and clarity.',
    bridge:
      'The `OPTIONS` request you see in Network before your `PUT` was not made by you: it is the CORS preflight the browser sends (see [[cors]]). And when you use `fetch` with `method: "PUT"` to edit a half-filled form, you are deleting on the server the fields you did not send, if the backend implements PUT correctly.',
    ans: 'GET fetches a resource without modifying it; POST creates a resource in a collection or triggers processing; PUT completely replaces the representation of the resource at that URI, so the fields you do not send are lost; PATCH applies a partial modification; DELETE removes; HEAD is like GET but without a body, useful to check headers or existence; and OPTIONS describes which methods the resource supports, and it is what the browser uses in the CORS preflight. The key difference between PUT and PATCH is full replacement versus partial change, and that PUT is idempotent by definition while PATCH is not necessarily.',
    myths: [
      'Using PUT and PATCH as synonyms. PUT replaces the whole resource; PATCH applies partial changes.',
      'Believing PUT only updates. With PUT the client can also create a resource at a URI it chooses (`PUT /archivos/foto.png`).',
      'Thinking DELETE must return the deleted resource. The usual thing is 204 with no body.',
    ],
    ex: [
      { q: 'You want to change only the shipping address of an existing order.', w: 'It is a partial modification of an existing resource. With PUT you would have to send the whole order.' },
      { q: 'The customer clicks "Confirm purchase" and a new order is created with an id generated by the server.', w: 'Creating in a collection where the server assigns the id is the classic case of POST to /v1/pedidos.' },
      { q: 'A health check only wants to know whether /v1/productos/42 exists and when it changed, without downloading the body.', w: 'HEAD returns the same headers as GET (Content-Length, ETag, Last-Modified) without a body.' },
      { q: 'An admin form sends all the fields of a product to overwrite it.', w: 'The full representation is replaced at a known URI: PUT.' },
    ],
  },
  // 5
  {
    title: 'Safe and idempotent methods',
    summary: 'A method is safe if it does not modify the server state (GET, HEAD, OPTIONS).',
    def: 'A method is **safe** if it does not modify the server state (GET, HEAD, OPTIONS). It is **idempotent** if sending it once or ten times leaves the server in the same state (the safe ones, plus PUT and DELETE). POST and PATCH guarantee neither.',
    ana: 'The elevator button is **idempotent**: pressing it five times does not call five elevators. A coin-operated candy dispenser **is not**: each coin gets you another candy. Looking at the floor display is **safe**: it changes nothing.',
    prob: 'It is the basis of retries. HTTP clients, load balancers and queues retry automatically when there are timeouts. If the method is idempotent, retrying does no harm; if it is not (POST), the retry can duplicate orders or charges, and it has to be protected with idempotency keys (see [[idempotencia-en-la-practica]]).',
    bridge:
      'A retry loop in your own function that wraps `fetch`, applied to everything, is dangerous precisely because of this: retrying a GET is fine, but retrying a payment POST can charge twice. A well-built function that wraps `fetch` only retries idempotent methods or requests with an idempotency key.',
    ans: 'A safe method is read-only: it must not change the server state, like GET, HEAD and OPTIONS. Idempotent means the effect of N identical requests is the same as that of one; all safe methods are, plus PUT and DELETE. POST is not and PATCH is not guaranteed. It matters because distributed systems have timeouts and automatic retries: retrying an idempotent method is harmless, but retrying a POST can duplicate an order or a payment, which is why idempotency keys are used for those operations.',
    myths: [
      'Believing idempotent means "always returns the same response". A DELETE can respond 204 and then 404; what does not change is the state.',
      'Thinking GET is safe because the framework guarantees it. It is a promise you keep or break in your code.',
      'Assuming PATCH is never idempotent. It can be (set email = x), but the standard does not guarantee it (add 1 to the stock).',
    ],
    ex: [
      { q: 'Which of these operations is idempotent?', w: 'Deleting order 9 twice leaves the same state: the order does not exist.' },
      {
        q: 'A GET /v1/reportes/generar creates a new file every time it is called. Which principle does it break?',
        o: ['Only idempotency', 'Method safety (and idempotency too)', 'None, it is valid', 'Only caching'],
        w: 'GET must be safe. If it generates a file every time, it also stops being idempotent. It should be POST /v1/reportes.',
      },
    ],
  },
  // 6
  {
    title: 'Status codes and their classic confusions',
    summary: 'A three-digit number that summarizes the result.',
    def: 'A three-digit number that summarizes the result. The first digit gives the family: **1xx** informational, **2xx** success, **3xx** redirection, **4xx** client error (the request is wrong) and **5xx** server error (the request was fine, but the server failed).',
    ana: 'The traffic lights at a service counter: green (**2xx**) "done"; yellow (**3xx**) "go to the other counter"; red with your name (**4xx**) "your form is filled in wrong"; red with the office sign (**5xx**) "the system is down, it is not your fault".',
    prob: 'The code is the first thing the client, retries, monitors and alerts read. Responding `200` with `{"error": true}` forces the frontend to inspect the body, hides the errors from monitoring and makes caches store error responses as if they were valid.',
    bridge:
      'After `await fetch(...)`, `response.ok` and `response.status` signal an error only when the code is 4xx or 5xx. When a backend answers 200 with an error inside, you have to check a field in the body (for example `ok: false`) after every request: that is a symptom of a poorly designed API. And your own function that wraps `fetch` and redirects to the login should react to **401**, not to 403.',
    ans: 'Codes are grouped into families: 2xx success, 3xx redirection, 4xx the client made a mistake and 5xx the server failed. The ones I use most are 200, 201 with Location when creating, 204 with no content, 400 and 422 for validation, 401 when authentication is missing, 403 when the user has no permission, 404, 409 for conflicts such as a duplicate email, 429 for rate limiting, 500 for internal errors, and 502, 503 and 504, which usually come from the proxy or the load balancer. The rule is that the code must reflect the real result, because clients, retries and monitoring depend on it.',
    myths: [
      '401 vs. 403: 401 means "not authenticated" (despite the name Unauthorized); 403 is "authenticated but without permission".',
      '400 vs. 422: 400 is a malformed request (broken JSON, impossible types); 422 is correct syntax but invalid content (negative quantity). FastAPI uses 422 for validation.',
      '200 vs. 201 vs. 204: 200 success with body; 201 a resource was created (with Location); 204 success without body.',
      '301 vs. 302: 301 is permanent (search engines and browsers remember it); 302 is temporary. 307 and 308 are their versions that do not allow changing the method.',
      '404 vs. 410: 404 does not exist (or I will not tell you); 410 existed and was deleted for good.',
      '500 vs. 502 vs. 503 vs. 504: 500 your app failed; 502 the proxy got an invalid response from your app; 503 the service is unavailable (maintenance or overload, with Retry-After); 504 the proxy got tired of waiting for your app.',
    ],
    ex: [
      { q: 'A user with a valid token tries to view another customer’s order.', w: 'We already know who they are (authenticated), but they lack permission: 403. Some APIs return 404 on purpose so as not to reveal that the resource exists.' },
      { q: 'The body is valid JSON, but the quantity field comes as -3.', w: 'The syntax is correct; the content breaks the rules. FastAPI responds 422 automatically.' },
      { q: 'You try to register a customer with an email that already exists.', w: '409 Conflict: the request clashes with the current state of the resource.' },
      { q: 'The load balancer waited 60 s for your payments API and it never responded.', w: '504 Gateway Timeout: the intermediary did not get a response from the origin server in time.' },
      { q: 'POST /v1/pedidos was processed and the order was created.', w: '201 Created, with the Location header pointing to the new resource.' },
      { q: 'The request arrives without an Authorization header at a protected endpoint.', w: '401: there are no credentials. It comes with WWW-Authenticate.' },
      { q: 'You receive an order to generate a heavy report; you queue it and will process it later.', w: '202 Accepted: it was accepted, but not completed yet. A URL to check the status is usually returned.' },
    ],
  },
  // 7
  {
    title: 'Essential headers and content negotiation',
    summary: 'Headers are the metadata of the message.',
    def: 'Headers are the metadata of the message. Some describe the body (`Content-Type`), others say what the client expects (`Accept`), who it is (`Authorization`, `User-Agent`), how to cache (`Cache-Control`, `ETag`) or where something ended up (`Location`).',
    ana: 'The instructions on the bag of a home delivery: "contains soup" (**Content-Type**), "I prefer Spanish or English" (**Accept-Language**), "here is my customer card" (**Authorization**), "eat within 1 hour" (**Cache-Control**).',
    prob: '**Content negotiation** lets the same resource be served in several formats or languages depending on what the client asks for, without inventing routes like `/productos.xml`. `Vary` tells caches that the response depends on certain headers, so they do not serve the Spanish version to a user who asked for English.',
    bridge:
      'When you look at **Response Headers** in DevTools, most of them are set by the backend or the proxy. The request\'s `Content-Type` is set by you: with `fetch`, if you send JSON you must declare `application/json`; if you send `FormData`, the browser builds it with its `boundary`, and if you set it by hand you break file uploads.',
    ans: 'Content-Type describes the format of the body being sent; Accept is what the client wants to receive, and if the server cannot comply it responds 406. Authorization carries the credentials, usually a Bearer token. Cache-Control and ETag control caching and conditional validation. Location indicates the URL of the resource created in a 201 or the target of a redirect. User-Agent identifies the client, but it is not reliable for security. Content negotiation is the mechanism by which the server chooses the representation according to Accept, Accept-Language or Accept-Encoding, and it must respond with Vary so caches respect it.',
    myths: [
      'Mixing up Content-Type and Accept: the first describes what I **send**; the second what I **want to receive**.',
      'Trusting User-Agent for security: the client can fake it.',
      'Forgetting Location in a 201: the client has to guess where the resource ended up.',
    ],
  },
  // 8
  {
    title: 'HTTP keeps no state: cookies, sessions and tokens',
    summary: 'HTTP is stateless: each request is independent and the server does not remember the previous one.',
    def: 'HTTP is **stateless**: each request is independent and the server does not remember the previous one. To "remember" the user, each request must carry proof of identity: a cookie with a session id (the state lives on the server) or a self-contained token (the state travels with the client).',
    ana: '**Session**: a theater cloakroom. They give you a ticket with number 47; the coat stays inside, and the attendant finds it with your ticket. **Token**: a festival wristband that says "VIP, valid until Sunday", signed by the organizer. The guard does not check any list: they verify the signature and let you in.',
    prob: 'The protocol keeping no state allows horizontal scaling: any instance can serve any request. But if you keep sessions in the memory of one instance, the user "loses the session" when the load balancer sends them to another. Sessions need a shared store (Redis); tokens do not, but they are hard to revoke before they expire.',
    bridge:
      'Your own function that wraps `fetch` and adds `Authorization: Bearer` to every request exists precisely because HTTP has no memory. With cookies you do not need that function: the browser attaches them on its own, which is why you need `credentials: "include"` when the API is on another domain.',
    ans: 'HTTP is stateless: the server does not associate a request with the previous one. To keep a session there are two approaches: server-side sessions, where the client keeps only an id in a cookie and the server stores the data in a store like Redis, which makes revocation easy but requires shared storage; or self-contained tokens like JWT, where the server only verifies the signature, which scales very well but makes revoking before expiration hard. Cookies are the transport mechanism the browser sends automatically; tokens usually travel in the Authorization header.',
    myths: [
      'Thinking "stateless" means the application has no state. The database has state; what does not exist is conversation state between requests in the protocol.',
      'Believing cookies and tokens are mutually exclusive. You can store a JWT inside an HttpOnly cookie.',
      'Believing a JWT is encrypted. By default it is only signed: anyone can read the payload.',
    ],
  },
  // 9
  {
    title: 'Authentication vs. authorization, JWT and OAuth2',
    summary: 'Authentication answers "who are you?" (401 if it fails).',
    def: '**Authentication** answers "who are you?" (401 if it fails). **Authorization** answers "may you do this?" (403 if it fails). The most common mechanisms are Basic, API keys, cookie sessions, JWT with refresh tokens and OAuth2 to delegate access.',
    ana: 'At a hotel, the front desk checks your ID and gives you a key card (**authentication**). The card opens your room and the gym, but not the presidential suite (**authorization**). The card stops working on checkout day (**expiration**). **OAuth2** is giving the laundry service a limited card that only opens your closet, without handing over yours.',
    prob: 'A JWT has three parts: the **header** (algorithm), the **payload** (claims such as `sub`, `role`, `exp`) and the **signature**, which guarantees nobody modified the first two. Since it cannot be revoked easily, the access token is short-lived (5–15 min) and a long-lived **refresh token**, stored securely and revocable on the server, is used to request a new one.',
    bridge:
      'Your own function that wraps `fetch` and, on a 401, calls `/refresh` and retries the original request is the client half of the refresh token flow. On the server side, that 401 appears when `jwt.decode` detects that `exp` has already passed. And when you log in with Google in an app, the backend is acting as an OAuth2 client.',
    ans: 'Authentication is verifying identity, and if it fails a 401 applies; authorization is deciding whether that identity may perform an action, and if it fails it is 403. Basic sends username and password in Base64 and is only acceptable over HTTPS; API keys identify applications; sessions keep the state on the server with a cookie; and a JWT is a signed token with header, payload and signature, which the server validates without querying the database, by checking signature and expiration. Since a JWT is hard to revoke, short access tokens and long, revocable refresh tokens are used. OAuth2 is a framework for an application to get limited access to a user’s resources without knowing their password; the recommended flow for web apps is Authorization Code with PKCE.',
    myths: [
      'Believing OAuth2 is an authentication protocol. It is for **delegated authorization**; authentication on top is added by OpenID Connect (the id_token).',
      'Thinking Base64 is encryption. Basic and the JWT payload are decoded in a second.',
      'Validating the role only in the frontend. Hiding a button does not protect the endpoint.',
    ],
    ex: [
      { q: 'A token with a valid signature but with exp in the past reaches your API.', w: 'The token no longer proves identity: 401. The client must use the refresh token.' },
      { q: 'A user with role "customer" calls DELETE /v1/productos/42, which requires the admin role.', w: 'They are authenticated, but not authorized: 403.' },
    ],
  },
  // 10
  {
    title: 'CORS and the OPTIONS preflight',
    summary: 'CORS is a browser mechanism that lets JavaScript from one origin read responses from another only if the server allows it.',
    def: 'CORS (Cross-Origin Resource Sharing) is a **browser** mechanism that relaxes the same-origin policy: it lets JavaScript from `https://app.tienda.co` read responses from `https://api.tienda.co` only if the server authorizes it with `Access-Control-Allow-*` headers.',
    ana: 'A building with a doorman (the **browser**). You arrive from another tower (another origin) to visit apartment 502. The doorman calls up: "Do you accept visitors from tower B with a big package?" (**preflight**). If the resident says yes, he lets you go up. But the resident (the **server**) heard the doorbell anyway: the doorman only decides whether you get to see the answer.',
    prob: 'Without the same-origin policy, any page you visit could read your email or your bank with your cookies. CORS lets you open that door in a controlled way. Misconfigured (`allow_origins=["*"]` with credentials, or reflecting any `Origin`) it cancels the protection.',
    bridge:
      "The red message `blocked by CORS policy: No 'Access-Control-Allow-Origin' header` does not mean your request did not arrive: in many cases the server did process it, but the browser hid the response from you. The development server proxy \"solves\" it because it makes the request leave from the same origin (the dev server), not because it fixes the backend. That is why you never see CORS errors with Postman or curl.",
    ans: 'CORS is a browser mechanism that allows, under the server’s control, a page from one origin to read responses from another origin, where origin means scheme, host and port. For non-simple requests, such as a PUT or any request with Authorization or JSON, the browser first sends an OPTIONS preflight asking whether the method and headers are allowed, and the server responds with Access-Control-Allow-Origin, Methods and Headers. It is a browser matter: it protects the user so other sites cannot read data with their credentials, but it does not protect the API from clients like curl or Postman, so it does not replace authentication.',
    myths: [
      'Believing CORS protects the server. It protects the browser user; an attacker with curl ignores it.',
      'Thinking it is fixed in the frontend. It is configured on the server (or on the proxy).',
      'Believing every request has a preflight. "Simple" ones (GET or POST with a form Content-Type and no custom headers) do not.',
    ],
  },
  // 11
  {
    title: 'HTTP caching: Cache-Control, ETag and 304',
    summary: 'With Cache-Control the server states whether a response can be stored, who can store it and for how long.',
    def: 'With `Cache-Control` the server states whether a response can be stored, who can store it and for how long. When it expires, the client revalidates with `If-None-Match`, sending the `ETag`; if it did not change, the server responds `304 Not Modified` with no body.',
    ana: 'The menu of the day written on a board. If it says "valid until 3 p.m." (**max-age**), you do not ask again. After 3 you ask: "Is it still menu version 7?" (**If-None-Match**). If they tell you "yes, the same one" (**304**), they do not read you the whole menu again.',
    prob: 'It avoids work and traffic: without caching, every user downloads the same catalog over and over. Misused it is dangerous: marking a response with user data as `public` can make a CDN serve Pedro the orders of Ana. For private data you use `private` or `no-store`.',
    bridge:
      'In the Network tab, the **Size** column shows `(disk cache)` or `(memory cache)` when the response did not touch the network, and the code **304** when there was a revalidation. The **Disable cache** checkbox exists precisely because these headers sometimes show you "stale" data during development.',
    ans: 'HTTP caching is controlled with Cache-Control: max-age defines how long the response is fresh, public or private defines whether intermediaries like a CDN may store it or only the browser, no-cache forces revalidation and no-store forbids storing. To revalidate, the server sends an ETag, which is a fingerprint of the resource version; the client sends it back in If-None-Match and, if it did not change, gets a 304 with no body, which saves bandwidth. Caching happens in the browser, in proxies and in CDNs, and private data must never be marked as public.',
    myths: [
      '`no-cache` does not mean "do not store": it means "store, but revalidate before using". The one that forbids storing is `no-store`.',
      'Thinking only the browser caches. CDNs, reverse proxies and gateways do too.',
      'Believing POST gets cached. In practice, only GET and HEAD.',
    ],
  },
  // 12
  {
    title: 'HTTPS and TLS',
    summary: 'HTTPS is HTTP inside a TLS channel.',
    def: 'HTTPS is HTTP inside a TLS channel. TLS guarantees **confidentiality** (nobody reads the traffic), **integrity** (nobody modifies it unnoticed) and **server authenticity** (the certificate proves you are talking to the real domain).',
    ana: 'A safe with a padlock. The server sends an **open padlock** that only it can close and open, together with a **notarized certificate** (signed by a certificate authority) that says "this padlock belongs to api.tienda.co". You use that padlock to send a shared key securely, and from then on both use that key, which is much faster.',
    prob: 'Without TLS, anyone on the café Wi-Fi can read tokens, passwords and cookies, or inject content into the response. With HTTPS, the full URL (path and query) is also encrypted; what does remain visible is the domain (through DNS and SNI) and the IP.',
    bridge:
      'The browser padlock and the `NET::ERR_CERT_DATE_INVALID` error are the certificate validation. That is why the self-signed certificate of the development server shows warnings: no trusted authority backs it. A cookie with `Secure` is only sent over HTTPS.',
    ans: 'HTTPS is HTTP over TLS. In the handshake, client and server agree on the version and algorithms; the server presents a certificate signed by a certificate authority that the client validates against its trusted roots, and with a Diffie-Hellman-style key exchange they derive a symmetric session key. From then on all traffic travels encrypted and with integrity. It protects against eavesdropping and tampering on the network, and authenticates the server; it does not protect against application vulnerabilities. In production it is usually terminated at the load balancer or the CDN, and it is complemented with HSTS.',
    myths: [
      'Believing HTTPS hides which site you visit. The domain stays visible.',
      'Thinking HTTPS makes the API secure. It protects the transport; it does not validate input or permissions.',
      'Believing TLS uses only asymmetric encryption. The asymmetric part is for key exchange and authentication; data travels with symmetric encryption, which is faster.',
    ],
  },
  // 13
  {
    title: 'HTTP/1.1 vs. HTTP/2 vs. HTTP/3',
    summary: 'HTTP/1.1 is text, with persistent connections but one request at a time per connection.',
    def: '**HTTP/1.1** is text, with persistent connections but one request at a time per connection. **HTTP/2** is binary and multiplexes many requests over a single TCP connection. **HTTP/3** does the same over **QUIC** (UDP), which prevents one lost packet from blocking everything.',
    ana: '**1.1**: a supermarket checkout with a queue; browsers open up to 6 checkouts per store. **2**: a single checkout that serves everyone by interleaving products, but if the belt jams (TCP packet loss), everyone waits. **3**: each customer has their own belt within the same checkout; if one jams, the others keep going.',
    prob: 'With HTTP/1.1, pages with dozens of resources suffered from the connection limit and **head-of-line blocking**, which led to hacks like concatenating files and sprites. HTTP/2 solved it at the HTTP level; HTTP/3 also solved it at the transport level, which matters above all on unstable mobile networks.',
    bridge:
      'In the Network tab you can enable the **Protocol** column and you will see `h2` or `h3`. The fact that today you do not need to pack everything into one giant bundle to reduce requests is partly thanks to HTTP/2 multiplexing.',
    ans: 'HTTP/1.1 introduced persistent connections, but each connection serves one request at a time, so browsers open several in parallel. HTTP/2 keeps the same semantics but uses a binary format, multiplexes many requests over a single connection and compresses headers; its limitation is that it runs over TCP, and one packet loss stalls all streams. HTTP/3 runs over QUIC, based on UDP, with independent streams, built-in TLS 1.3 and faster connection setup. For the backend developer the API does not change; it is usually handled by the CDN or the load balancer.',
    myths: [
      'Believing HTTP/2 changes the API. The semantics are identical; the wire format changes.',
      'Thinking HTTP/3 replaces TCP everywhere. It is optional and coexists with HTTP/2 as an alternative.',
      'Assuming HTTP/2 completely removes head-of-line blocking. It removes it in HTTP, not in TCP.',
    ],
  },
  // 14
  {
    title: 'REST: constraints and the Richardson model',
    summary: 'REST is an architectural style (Roy Fielding, 2000), not a protocol or a standard.',
    def: 'REST is an **architectural style** (Roy Fielding, 2000), not a protocol or a standard. It defines constraints: client-server, stateless, cacheable, uniform interface, layered system and, optionally, code on demand. The Richardson model measures how well an API meets them, from level 0 to 3.',
    ana: 'REST is like the rules of a public library: each book has a unique location (**URI**), all of them are requested with the same form (**uniform interface**), the librarian does not remember your previous visit (**stateless**), you may photocopy pages that say "copying allowed" (**cacheable**) and you do not know whether the book comes from the warehouse or another branch (**layers**).',
    prob: 'The constraints exist for a reason: **stateless** allows scaling, **cacheable** reduces load, **uniform interface** makes any client understand any resource, and **layers** allows putting CDNs, load balancers and gateways in place without the client noticing.',
    bridge:
      'An API client module with `getAll`, `getById`, `create`, `update` and `remove` maps almost one to one to a level 2 API. If your module has methods like `ejecutarAccion(tipo, payload)` against a single endpoint, you are consuming a level 0.',
    ans: 'REST is an architectural style defined by Roy Fielding, based on constraints: client-server separation, stateless communication, cacheable responses, a uniform interface (resources identified by URIs, manipulated through representations, self-descriptive messages and hypermedia), a layered system and code on demand as optional. The Richardson maturity model makes it practical: level 0 is a single RPC-style endpoint; level 1 introduces resources with their own URIs; level 2 uses HTTP methods and codes correctly, which is where most of the industry is; and level 3 adds HATEOAS, with links that indicate the possible actions.',
    myths: [
      'Believing REST is "HTTP + JSON". You can use HTTP and JSON and not be REST, and REST does not require JSON.',
      'Thinking most "REST" APIs comply with full REST. Almost all are at level 2, without HATEOAS.',
      'Confusing REST with CRUD. Resources can represent processes (a payment, an approval), not just tables.',
    ],
  },
  // 15
  {
    title: 'Designing a REST API',
    summary: 'Designing a REST API is modeling the domain as plural resources, with predictable routes, filters, pagination and versioning.',
    def: 'Designing a REST API is modeling the domain as **resources** (plural nouns), with predictable routes, relationships expressed with moderate nesting, filters and ordering in the query string, pagination for collections and a versioning strategy from day one.',
    ana: 'An airport signage system: consistent names ("Gates A1–A20"), a clear hierarchy ("Terminal 2 → Gate B5"), no signs saying "Walk-to-the-plane-now". If each terminal used different conventions, nobody would make their flight.',
    prob: 'A badly designed API is hard to learn, to document and to evolve without breaking clients. **Offset pagination** (`?page=3`) is simple and lets you jump to a page, but it gets slow with large tables and repeats or skips items when data is inserted. **Cursor pagination** is stable and fast, but it does not let you jump to page 50. **Versioning** in the URL (`/v1`) is the most common and visible; by header it is more "pure" but less practical.',
    bridge:
      'A paginated table works with offset because it needs to jump between pages and show the total. An infinite scroll, on the other hand, fits cursor. When you design the API for your own frontend, choose the pagination according to the UI.',
    ans: 'I model the domain as resources with plural nouns, for example /clientes, /pedidos and /productos, and let the HTTP method express the action. I use one level of nesting for ownership relationships, like /clientes/7/pedidos, and direct access for everything else. Filters, ordering and pagination go in the query string. To paginate I choose offset when the UI needs to jump between pages and the table is moderate, and cursor when there is a lot of volume or changing data, because it is stable and efficient. I version from the start, usually in the URL as /v1, and only bump the version for incompatible changes. Actions that are not CRUD I model as sub-resources, for example POST /pedidos/1093/cancelacion.',
    myths: [
      'Mixing singular and plural (`/cliente/7` and `/pedidos`). The convention is always plural.',
      'Believing every relationship must be nested. More than one level usually means the resource deserves its own route.',
      'Breaking contracts without versioning: renaming a field is an incompatible change.',
    ],
    review: [
      'Correct: plural resource and an id.',
      'Verb in the URL. It should be POST /v1/pedidos.',
      'Correct: filter in the query string.',
      'GET with a side effect and a verb in the path. It should be DELETE /v1/pedidos/1093.',
      'Correct: partial modification.',
      'Mixes singulars and does not say which order. It should be /v1/clientes/7/pedidos.',
      'Correct: creates a payment as a sub-resource of the order.',
      'Technically valid, but with offset at that depth the query is expensive. On large tables, cursor.',
    ],
  },
  // 16
  {
    title: 'Designing responses and errors (Problem Details)',
    summary: 'A good API always responds with the same shape: consistent successes and errors with the right code and a structured body.',
    def: 'A good API always responds with the same shape: successes with the resource or a consistent envelope, and errors with a correct HTTP code plus a structured body. The standard for errors is **Problem Details** (RFC 9457), with `type`, `title`, `status`, `detail` and `instance`.',
    ana: 'The warning panel of a car: a red light that says "error" is not enough. A good one tells you which system failed, how serious it is and what to do. And every car of the brand uses the same symbols.',
    prob: 'If each endpoint returns errors with a different shape, the frontend needs a parser per endpoint. If the message is vague ("Error"), support cannot help. If the message exposes internals (stack traces, SQL queries), you are giving information to an attacker.',
    bridge:
      'After `await fetch(...)`, your own function that wraps `fetch` has `response.status` and the body. With Problem Details across the backend, that function can show the body’s `title` in a toast without a `switch` per endpoint.',
    ans: 'I define a consistent response format for the whole API and use the correct HTTP code for each case. For errors I follow Problem Details, RFC 9457, with the application/problem+json media type and the type, title, status, detail and instance fields, plus custom fields when they add value, such as per-field errors in a validation. Messages must be useful to the consumer, but without exposing internal details: the stack trace stays in the logs with a trace_id that I also return in the response to correlate. In FastAPI I centralize it with exception handlers, so no endpoint builds its error by hand.',
    myths: [
      'Returning 500 for validation or business errors. 5xx means the server failed, not that the user sent something invalid.',
      'Exposing internal details in production. The stack trace goes to the logs, with a `trace_id` to correlate.',
      'Believing the FastAPI error format (`{"detail": ...}`) is enough for everything. It works for validation, but a single format for the whole API is better.',
    ],
  },
  // 17
  {
    title: 'Idempotency in practice: keys and duplicate payments',
    summary: 'For non-idempotent operations, the client generates a unique idempotency key and sends it in a header.',
    def: 'For non-idempotent operations (such as creating a payment), the client generates a unique **idempotency key** and sends it in a header. The server stores the key with the response; if a retry arrives with the same key, it returns the stored response instead of processing again.',
    ana: 'The filing number of a paperwork procedure: if you bring the same form twice with the same filing number, the office tells you "that procedure is already in progress, here is your receipt" instead of opening another file.',
    prob: 'Between the client and your API there are networks that go down. If the payment response gets lost, the client does not know whether it was charged or not, and the natural reaction is to retry. Without a key, each retry is a new charge. Gateways like Stripe require this pattern.',
    bridge:
      'Disabling the "Pay" button after the click and ignoring clicks while a request is in flight prevent the double click, but they do not protect against a retry from your function that wraps `fetch` or from the network. The robust solution is to generate a `crypto.randomUUID()` when the checkout opens and send it on every attempt as `Idempotency-Key`.',
    ans: 'For operations that are not naturally idempotent, such as creating a payment or an order, the client generates a unique key per intent and sends it in a header like Idempotency-Key. The server reserves it atomically, processes and stores the response associated with the key with a time to live. If a retry arrives with the same key, it returns the stored response without processing again; if the same key arrives with a different body, it rejects the request. That way retries caused by timeouts are safe. I complement it with unique constraints in the database as the last line of defense.',
    myths: [
      'Generating a new key on each retry. Then it is useless: the key identifies the intent, not the attempt.',
      'Checking and storing the key in two non-atomic steps. Two simultaneous requests can pass the check at the same time.',
      'Believing frontend validation is enough.',
    ],
  },
  // 18
  {
    title: 'Rate limiting, 429 and Retry-After',
    summary: 'Rate limiting caps how many requests a client can make in a period.',
    def: '**Rate limiting** caps how many requests a client can make in a period. When it is exceeded, the server responds `429 Too Many Requests` and, with `Retry-After`, says how long to wait. The `RateLimit-*` headers report the remaining quota.',
    ana: 'A water dispenser that fills your glass at a fixed rate: you can drink several in a row if the tank is full (burst), but if you empty it, you have to wait for it to refill. It is the **token bucket** algorithm.',
    prob: 'It protects the API from abuse, scrapers, brute-force attacks on the login and buggy clients that make requests in a loop. It also shares capacity among clients and controls costs. The most common algorithms are **fixed window**, **sliding window** and **token bucket**.',
    bridge:
      'An autocomplete search box that does not wait before sending is the classic 429 generator. And your own retry function that wraps `fetch` should read `Retry-After` and use **exponential backoff with jitter** instead of retrying immediately.',
    ans: 'Rate limiting restricts the number of requests per client in a time window to protect the API from abuse and share capacity. It is implemented with algorithms like fixed window, sliding window or token bucket, which allows controlled bursts, and in an environment with several instances the counter must live in a shared store like Redis or in the API gateway. When the limit is exceeded I respond 429 Too Many Requests with Retry-After, and report the quota with RateLimit headers. On the client side, the right thing is to respect Retry-After and retry with exponential backoff and jitter.',
    myths: [
      'Limiting only by IP. Behind an office or a NAT there are hundreds of users with the same IP; for authenticated APIs it is better to limit by user or API key.',
      'Confusing 429 with 503. 429 is "you in particular exceeded your quota"; 503 is "the service is unavailable to everyone".',
      'Retrying immediately after receiving a 429.',
    ],
  },
  // 19
  {
    title: 'REST vs. GraphQL, gRPC, WebSockets, SSE and webhooks',
    summary: 'REST is the standard for public resource APIs.',
    def: 'REST is the standard for public resource APIs. **GraphQL** lets the client ask for exactly the fields it needs. **gRPC** is fast binary RPC between services. **WebSockets** give persistent bidirectional communication, **SSE** is a stream from the server to the client, and **webhooks** are HTTP requests that someone else’s server sends you when an event happens.',
    ana: '**REST**: a restaurant with a fixed menu. **GraphQL**: a buffet where you build your plate. **gRPC**: the internal communication between kitchen and bar with short codes. **WebSocket**: an open phone call. **SSE**: the radio, you only listen. **Webhook**: "we will call you when your table is ready".',
    prob: 'Choosing badly is costly: GraphQL in a simple public API adds complexity (hard HTTP caching, expensive queries); polling every second instead of SSE wastes resources; WebSockets for something that flows in only one direction complicates scaling; and not verifying a webhook’s signature lets anyone mark orders as paid.',
    bridge:
      'You already know the client side of almost all of them: Apollo for GraphQL, `new WebSocket()`, `new EventSource()` for SSE, which is exactly what AI chat interfaces use to show the answer token by token. Webhooks have no frontend side: they are server to server.',
    ans: 'REST is my default option for resource APIs, especially public ones, for its simplicity, HTTP caching and ecosystem. I consider GraphQL when there are many clients with very different data needs and I want to avoid fetching too much data or making several calls, accepting more complexity in caching, per-field authorization and query cost control. I use gRPC between internal microservices for performance and typed contracts with Protocol Buffers. WebSockets for real-time bidirectional communication, like chat. SSE when only the server sends updates, like progress or AI streaming. And webhooks to notify events to other systems, always signed and processed idempotently.',
    myths: [
      'Believing GraphQL replaces REST. It solves other problems: many clients with different data needs.',
      'Thinking gRPC works directly from the browser. It needs gRPC-Web and a proxy.',
      'Using WebSockets for one-way notifications when SSE is enough.',
    ],
  },
  // 20
  {
    title: 'Basic API security',
    summary: 'The basics are mandatory HTTPS, validating input, authenticating and authorizing every endpoint, rate limiting and guarding the token.',
    def: 'The basics are: mandatory HTTPS, **never trusting input** (validating it and using parameterized queries), authenticating and authorizing on every endpoint, protecting against CSRF when cookies are used, preventing the API from serving content that enables XSS, limiting requests and deciding carefully where the client stores the token.',
    ana: 'The layered security of a building: fences (**HTTPS**), a doorman who checks your ID on every floor, not just at the entrance (**authorization on every endpoint**), package inspection (**validation**) and not leaving the master keys under the doormat (**token storage**).',
    prob: 'The most common vulnerability in APIs (OWASP API Top 10) is **broken object level authorization**: changing `/pedidos/1093` to `/pedidos/1094` and seeing someone else’s order. It is followed by weak authentication, excessive data exposure and lack of limits.',
    bridge:
      'Storing the token in `localStorage` is the most common thing in SPAs and it is vulnerable to XSS: any injected script reads it. An `HttpOnly` cookie is not accessible from JavaScript, but it reopens the door to CSRF, which is mitigated with `SameSite` and CSRF tokens. A balanced pattern is the access token in memory (in an API client module) and the refresh token in an HttpOnly cookie. Frontend frameworks escape what they render by default, and that protects you from XSS, except when you insert unescaped HTML (for example with `innerHTML`); on the server side, the defense is validating input and returning JSON with the correct `Content-Type`, never HTML built with user data.',
    ans: 'I start with mandatory HTTPS with HSTS. All input is validated on the server with types, ranges and lengths, and database queries are parameterized to prevent injection. I authenticate on every request and authorize at the object level, verifying that the resource belongs to the user, because it is the most common vulnerability in APIs. I return only the necessary fields with explicit response models, apply rate limiting and do not expose internal errors. If I use cookies to authenticate, I protect against CSRF with SameSite, CSRF tokens and Origin verification. About the token on the client: localStorage is vulnerable to XSS; I prefer a short access token in memory and the refresh token in an HttpOnly, Secure and SameSite cookie.',
    myths: [
      'Believing the frontend validates and therefore the backend does not need to. Anyone can call the API with curl.',
      'Thinking CSRF affects APIs with a Bearer token in a header. It affects them when the credential travels automatically, that is, with cookies.',
      'Believing HTTPS covers everything. It only protects the transport.',
    ],
  },
]
