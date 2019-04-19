var url = window.location.href;

var CATEGORY = "t-shirts";
var ITEM_NAME = "Keyboard Tee";
var SIZE = "0";
var COLOR = "Black";

var BILLING_INFO = {
    //"name": "Tomasz Kostowski",
    //"email": "tomek1kkgw@gmail.com",
    //"tel": "570650687",
    //"address": "Wegierska 1 m12",
    //"address 2": "",
    //"zip": "02319",
    //"city": "Warsaw",
    "number": "1111 1111 1111 1111",
    "cvv": "123"
}
var TYP_KARTY = 0;
var MIESIAC_KARTY = 10;
var ROK_KARTY = 2020;
var CHECKOUT_DELAY = 3000;
var REFRESH_INTERVAL = 2000;


const MAIN_URL = "https://www.supremenewyork.com/shop/all";
const CATEGORY_URL = MAIN_URL + "/" + CATEGORY;
const CHECKOUT_URL = "https://www.supremenewyork.com/checkout";

// ----- DROP TIME -----
var TIMER = true;
var hour = 14;
var minute = 58;
var seconds = 00;

if (url == MAIN_URL)
{
	//sessionStorage.setItem('counter', '0');
    //while(true) {
    //    var today = new Date();
    //    if(today.getHours() >= hour && today.getMinutes() >= minute && today.getSeconds() >= seconds) break;
    //    pausecomp(500);
    //}
	
	if (TIMER == true)
	{
		var today = new Date();
        var totalTime = ((hour - today.getHours()) * 3600000) + ((minute - today.getMinutes()) * 60000) + ((seconds - today.getSeconds()) * 1000);
        console.log("Program will start in " + totalTime/1000 + " seconds");
		setTimeout("pickCategory()", totalTime);
	}
	else
	{
		pickCategory();
	}
}
if (url == CATEGORY_URL)
{
    pickItem();
}
if (url.length > CATEGORY_URL.length + 3)
{
    pickSize();
    addToBasket();
    setTimeout("checkout()", 300);
}
if (url == CHECKOUT_URL)
{
    autoFill(BILLING_INFO);
    setTimeout("processPayment()", CHECKOUT_DELAY);
}

function processPayment()
{
    document.getElementsByName("commit")[0].click();
}

function pickCategory()
{
    chrome.storage.sync.get('CATEGORY', function(data)
    {
        var redirect = "https://www.supremenewyork.com/shop/all/jackets";
        var replace = redirect.replace("jackets", CATEGORY);
        chrome.runtime.sendMessage({redirect: replace});
    });
}

function pickItem()
{
    var found = false;

    // TESTING NEW ITEMS ADDING

    // var x = parseInt(sessionStorage.getItem('counter'));
    // x++;
    // sessionStorage.setItem('counter', x.toString());
    // if (x > 3)
    // {
    //     ITEM_NAME = "Keyboard Tee";
    // }
    // console.log(ITEM_NAME);

    chrome.storage.sync.get('ITEM_NAME', function(data) 
    {
        var items = document.getElementsByClassName('name-link');
                    
        for (var i = 0; i < items.length - 1; i++)
        {
            if ((items[i].innerHTML).includes(ITEM_NAME) && (items[i+1].innerHTML).includes(COLOR))
            {
                found = true;
                chrome.runtime.sendMessage({redirect: items[i].href});
                break;
            }
        }
    });
    if (found == false)
        setTimeout(function() {location.reload();}, REFRESH_INTERVAL);
}


function fillCard(index)
{
    if (document.getElementById("cnb").value.length < nr_karty.length)
        document.getElementById("cnb").value += nr_karty[index];
}

function autoFill(info)
 {
    if (TYP_KARTY == 1)
    {
        document.getElementById("credit_card_type").selectedIndex = 2;
    }
    var inputs = document.querySelectorAll('input:not([type=submit]):not([type=hidden])');
    inputs.forEach(function(element) 
    {
        var prev_sibling = element.previousElementSibling;
        if (prev_sibling) 
        {
            var label_text = prev_sibling.innerHTML.toLowerCase();
            var value = info[label_text];
            if (value)
            {
                setInput(element, value);
            }     
        }
    });
    document.getElementById("credit_card_month").selectedIndex = MIESIAC_KARTY - 1;
    document.getElementById("credit_card_year").selectedIndex = ROK_KARTY - 2019;
    document.getElementById("order_terms").checked = true;
    document.getElementById("order_terms").parentElement.classList.add('checked');
}

function addToBasket()
{
    if (document.getElementsByName("commit")[0].value == "add to basket")
        document.getElementsByName("commit")[0].click();
}

function pickSize()
{
    document.getElementById("size").selectedIndex = SIZE;
}

function checkout()
{
    chrome.runtime.sendMessage({redirect: CHECKOUT_URL});
}

function setInput(element, value) {
    element.focus();
    element.value = value;
    element.blur();
  }

  function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}



