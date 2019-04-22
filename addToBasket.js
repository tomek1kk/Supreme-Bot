var url = window.location.href;

var items = [ ["sweatshirts", ["Zip Up"], "XLarge", ["Red"]] ];
             // ["sweatshirts", ["Zip"], "Large", ["Red"]] ];

var SET_COUNTRY = true;
var BILLING_INFO = {
    // "name": "Test Name",
    // "email": "email@gmail.com",
    // "tel": "123456789",
    // "address": "ulica nr domu",
    // "address 2": "",
    // "zip": "02319",
    // "city": "Warsaw",
    "number": "1111 1111 1111 1111",
    "cvv": "123"
}

var TYP_KARTY = 0; // 0 for VISA, 1 for MASTERCARD
var MIESIAC_KARTY = 10;
var ROK_KARTY = 2020;
var CHECKOUT_DELAY = 3000;
var REFRESH_INTERVAL = 2000;

const MAIN_URL = "https://www.supremenewyork.com/shop/all";
const CHECKOUT_URL = "https://www.supremenewyork.com/checkout";
const TIME_SERVER_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=SxiYpwxzxdmqzwTHoxfoXGZwOvhLfnIYPmnMBGWiqdQlvE4aKHXZ_n7chjoFITw7uIlzs1hsnBMBOg34RHnSH3SqoEKW_wJ-m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJ9GRkcRevgjTvo8Dc32iw_BLJPcPfRdVKhJT5HNzQuXEeN3QFwl2n0M6ZmO-h7C6eIqWsDnSrEd&lib=MwxUjRcLr2qLlnVOLh12wSNkqcO1Ikdrk";

// ----- DROP TIME -----
var TIMER = true;
var hour = 11;
var minute = 48;
var seconds = 20;

if (url == MAIN_URL)
{
    sessionStorage.setItem('itemsAdded', '0');
	if (TIMER == true)
	{
        var table = [1, 2, 3];
        fetch(TIME_SERVER_URL).then(timer => timer.json())
        .then(timer => { 
                var totalTime = ((hour - timer.hours - 2) * 3600000) + ((minute - timer.minutes) * 60000) + ((seconds - timer.seconds) * 1000);
                console.log("Program will start in " + totalTime/1000 + " seconds");
		        setTimeout("pickCategory(items[0][0])", totalTime);
         });
	}
	else
	{
		pickCategory(items[0][0]);
	}
}
if (parseInt(sessionStorage.getItem('itemsAdded')) < items.length)
{
    if (url == MAIN_URL + "/" + items[sessionStorage.getItem('itemsAdded')][0])
    {
        pickItem(items[sessionStorage.getItem('itemsAdded')][1], items[sessionStorage.getItem('itemsAdded')][3]);
    }
}
if (url.length > MAIN_URL.length + 15)
{
    var x = parseInt(sessionStorage.getItem('itemsAdded'));
    x++;
    sessionStorage.setItem('itemsAdded', x.toString());
    pickSize(items[x - 1][2]);
    addToBasket();

    var p = setInterval(function() { 
        if (document.getElementById("cart").className != "hidden" && document.getElementById("items-count").textContent[0] == x.toString())
        {
            clearInterval(p);
            if (x >= items.length)
                checkout();
            else
                pickCategory(items[x][0]);
        }
    }, 50);

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
function pickCategory(cat)
{
    chrome.storage.sync.get('cat', function(data)
    {
        var link = MAIN_URL + "/" + cat;
        chrome.runtime.sendMessage({redirect: link});
    });
}

function pickItem(name, color)
{
    var found = false;
    console.log("looking for item");
    chrome.storage.sync.get('name', function(data) 
    {
        var products = document.getElementsByClassName('name-link');
        console.log("Products length: " + products.length);
        for (var i = 0; i < products.length - 1; i++)
        {
            for (var j = 0; j < name.length; j++)
            {
                for (var k = 0; k < color.length; k++)
                {
                    if ((products[i].innerHTML).includes(name[j]) && (products[i+1].innerHTML).includes(color[k]))
                    {
                        found = true;
                        chrome.runtime.sendMessage({redirect: products[i].href});
                        break;
                    }
                }
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
    if (TYP_KARTY == 1) // MASTERCARD
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

    // document.getElementById("order_billing_name").value = "First Last";
    // document.getElementById("order_billing_zip").value = "02319";
    // if (SET_COUNTRY == true)
    //     document.getElementById("order_billing_country").selectedIndex = 25;

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

function pickSize(size)
{
    document.getElementById("size").selectedIndex = size;
    var selectbox = document.getElementById("size");
    for (var i = 0; i < selectbox.length; i++)
    {
        if (selectbox.options[i].label == size)
        {
            selectbox.selectedIndex = i;
            break;
        }
    }
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