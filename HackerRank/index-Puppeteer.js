let puppeteer = require('puppeteer')
let fs = require('fs')
let path = require('path')
let creds = process.argv[2]
let moderator = process.argv[3]
let uname, pass
let gURL
let page , pages

initiate()
async function initiate() {
    try {
        let contents = await fs.promises.readFile(creds);
        let credentials = JSON.parse(contents)
        uname = credentials.username;
        pass = credentials.password;
        url = credentials.url;

        let browser = await puppeteer.launch({
            headless : false
        })
    
        pages = await browser.pages()
        page = pages[0]

        await page.goto(url)
        await page.waitForSelector('input#input-1',{visible : true})
        await page.type('input#input-1', uname)
        await page.type('input#input-2', pass)
        await page.click('button.auth-button')
        await page.waitForNavigation({waitUntil: 'networkidle0'})
        await page.click('div.dropdown-auth.profile-menu a')
        await page.click('a[data-analytics=NavBarProfileDropDownAdministration]')
        await page.waitForNavigation({waitUntil: 'networkidle0'})
        let tabs = await page.$$('ul.admin-tabbed-nav.nav-tabs a')
        await tabs[1].click()
        await page.waitForNavigation({waitUntil: 'networkidle0'})

        StartQuestion()


    }catch(err)
    {
        console.log(err)
    }
}

async function StartQuestion()
{
    try{
        let URL = await page.url()
        await page.waitForSelector('div.table-wrap div.table-body a')
        let sel = 'div.table-wrap div.table-body a';
        let queURL =  await page.evaluate((sel) => {
            let elements = Array.from(document.querySelectorAll(sel));
            let links = elements.map(element => {
                return element.href
            })
            return links;
        }, sel);
        for(let i = 0 ; i < queURL.length ; i++)
        {
            await page.goto(queURL[i],{waitUntil: 'networkidle0'})
            await page.waitForSelector("li[data-tab=moderators] a",{visible : true})
            await page.click("li[data-tab=moderators] a")
            await page.waitForSelector("input#moderator",{visible : true})
            await page.type('input#moderator',moderator)
            await page.click('button.moderator-save')
        }
        await page.goto(URL,{waitUntil: 'networkidle0'})
        await page.waitForSelector("div.pagination li a[data-attr1=Right]",{visible : true})
        let href = await page.evaluate(async function(){
            let nav = document.querySelector("div.pagination li a[data-attr1=Right]").getAttribute("href")
            return nav
        })
        if(href != null)
        {
            await page.goto("https://www.hackerrank.com" + href,{waitUntil: 'networkidle0'})
            StartQuestion()
        }
        else
        {
            console.log("Completed")
        }


    }
    catch(err)
    {
        console.log(err)
    }
}