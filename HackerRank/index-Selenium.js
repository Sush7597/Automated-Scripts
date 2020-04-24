require('chromedriver')
let sd = require('selenium-webdriver')
let fs = require('fs')
let path = require('path')
let driver = new sd.Builder().forBrowser('chrome').build()
let creds = process.argv[2]
let moderator = process.argv[3]
let uname, pass
let gURL

initiate()
async function initiate() {
    try {
        let contents = await fs.promises.readFile(creds);
        let credentials = JSON.parse(contents)
        uname = credentials.username;
        pass = credentials.password;
        url = credentials.url;

        await driver.manage().setTimeouts({
            implicit: 10000,
            pageLoad: 10000
        })

        await driver.get(url)

        let uField = await driver.findElement(sd.By.css('input#input-1'))
        let pField = await driver.findElement(sd.By.css('input#input-2'))
        await uField.sendKeys(uname)
        await pField.sendKeys(pass)
        let submit = await driver.findElement(sd.By.css('button.auth-button'))
        await submit.click()
        //await driver.wait(sd.until.elementIsVisible(sd.By.css('a[data-analytics=NavBarProfileDropDownAdministration]')))
        let Admin = await driver.findElement(sd.By.css('a[data-analytics=NavBarProfileDropDownAdministration]'))
        let AdminURL = await Admin.getAttribute('href')
        await driver.get(AdminURL)
        await Loader()
        await driver.wait(sd.until.elementLocated(sd.By.css("ul.admin-tabbed-nav li a")))
        let tab = await driver.findElements(sd.By.css("ul.admin-tabbed-nav li a"))
        await tab[1].click()
        StartQuestion()
    }
    catch (err) {
        console.log(err)
    }
}
async function Loader()
{
return new Promise( async function (resolve, reject){
    try
    {
        let Overlay = await driver.findElement(sd.By.css('span.ajax-loader'))
        await driver.wait(sd.until.elementIsNotVisible(Overlay , 10000))
        resolve()
    }
    catch(err)
    {
    }
})
}

async function StartQuestion()
{
    try{
        await Loader()
        let URL = await driver.getCurrentUrl()
        let ques = await driver.findElements(sd.By.css("div.table-wrap div.table-body a"))
        let queURL = []
        for(let i = 0 ; i < ques.length; i++)
        {
            queURL.push(await ques[i].getAttribute('href'))
        }
        for(let i = 0 ; i < ques.length; i++)
        {
            await Loader()
            await driver.get(queURL[i])
            await Loader()
            await driver.wait(sd.until.elementLocated(sd.By.css('span.tag')));
            await driver.wait(sd.until.elementLocated(sd.By.css("ul.admin-tabbed-nav li[data-tab=moderators] a")))
            let Tab = await driver.findElement(sd.By.css("li[data-tab=moderators] a"))
            await Tab.click()
            await Loader()
            let input = await driver.findElement(sd.By.css("input#moderator"))
            await input.sendKeys(moderator)
            let btn = await driver.findElement(sd.By.css("button.moderator-save"))
            await btn.click()
        }
            await driver.get(URL)
            let next = await driver.findElement(sd.By.css("div.pagination li a[data-attr1=Right]"))
            let newURL = await next.getAttribute('href')
            if(newURL != null)
            {
                await driver.get(newURL)
                StartQuestion()
            }
            else
            {
                console.log("Comepleted!")
            }
        }
    catch(err)
    {
        console.log(err)
    }
}