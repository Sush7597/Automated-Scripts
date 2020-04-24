let puppeteer = require('puppeteer')
let fs = require('fs')
let creds = process.argv[2]
let uname, pass
let url, FBpage , count
let page , pages

initiate()
async function initiate() {
    try {
        let contents = await fs.promises.readFile(creds);
        let credentials = JSON.parse(contents)
        uname = credentials.email;
        pass = credentials.password;
        url = credentials.url;
        FBpage = credentials.page
        count = credentials.count

        let browser = await puppeteer.launch({
            headless : false,
            args: ["--disable-notifications"]
        })
        pages = await browser.pages()
        page = pages[0]

        await page.goto(url)
        await page.waitForSelector('input[data-testid=royal_email]',{visible : true})
        await page.type('input[data-testid=royal_email]', uname)
        await page.type('input[data-testid=royal_pass]', pass)
        await page.click('input[data-testid=royal_login_button]')
        await page.waitForSelector( 'input._1frb' ,{visible: true})
        await page.type('input._1frb',FBpage)
        await page.keyboard.press('Enter')
        await page.waitForSelector( "div._77we a" ,{visible: true})
        await page.evaluate(()=>{
           document.querySelector('div._77we a').click()
        })
        await page.waitForSelector( 'div[data-key=tab_posts]' ,{visible: true})
        await page.evaluate(()=>{
            document.querySelector('div[data-key=tab_posts] a._2yau').click()
         })
         await page.waitForNavigation({waitUntil: 'networkidle0'})

         await likeThePost()

    }catch(err)
    {
        console.log(err)
    }
}

async function likeThePost()
{
    try{
        for(let i = 0 ; i < count/4 + 1 ; i++)
        {
        
            await page.waitForSelector("span.uiMorePagerLoader",{ hidden  : true })

            await page.evaluate(()=>{
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, scrollHeight);
            })
        }


        let post = await page.$$('div._666k a._6a-y._3l2t._18vj')
        
        for(let i = 0 ; i < count ; i++)
        {
            await post[i].click()            
        }

        console.log("Completed.")

    }
    catch(err)
    {
        console.log(err)
    }
}
