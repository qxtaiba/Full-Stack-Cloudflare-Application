
class AttrElemHandler {
    constructor(attributeName) {
        this.attributeName = attributeName;
    }

    element(element) {
        const attribute = element.getAttribute(this.attributeName);
        if (attribute) {
            element.setAttribute(
                this.attributeName,
                attribute.replace('https://cloudflare.com', 'https://www.linkedin.com/in/alnuaimy/')
            );
        }

    }

    text(text) {
        if (!text.lastInTextNode) {
            if (text.text.includes("Return to cloudflare.com")) { 
                text.replace('Take a look at my LinkedIn');
            }

            if (text.text.includes("Variant")) { 
                text.replace('Hi, Cloudflare!');
            }

            if (text.text.includes("take home project")) { 
                text.replace("Thank you for all your great work during these troubling times. It's really appreciated!");
            }
        } 
    }
}

function getCookie(request, id) {
    let res = null;
    let cookieInfo = request.headers.get('Cookie');

    if (cookieInfo) {
        let cookieList = cookieInfo.split(';');
        cookieList.forEach(cookie => {
            let cookieID = cookie.split('=')[0].trim();
            if (cookieID === id) {
                res = cookie.split('=')[1];
            }
        });
    }
    return res;
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    try {
        const cookie = getCookie(request, "variant");
        if (!cookie) {
                const rewriter = new HTMLRewriter()
                .on('a#url', new AttrElemHandler('href'))
                .on('h1#title', new AttrElemHandler())
                .on('p#description', new AttrElemHandler())
                .on('title', new AttrElemHandler());

            const output = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
            const text = await output.text();
            const outputJSON = JSON.parse(text);


            const variant = (Math.random() < 0.5) ? 0: 1;
            const url = await fetch(outputJSON.variants[variant]);
            return rewriter.transform(url);
        } else {  
            return rewriter.transform(cookie);
        }
        
    } catch(err) {
        console.log(err);
    }
}