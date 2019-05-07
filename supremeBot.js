const MAIN_URL = "https://www.supremenewyork.com/shop/all";
const CHECKOUT_URL = "https://www.supremenewyork.com/checkout";
const TIME_SERVER_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=SxiYpwxzxdmqzwTHoxfoXGZwOvhLfnIYPmnMBGWiqdQlvE4aKHXZ_n7chjoFITw7uIlzs1hsnBMBOg34RHnSH3SqoEKW_wJ-m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJ9GRkcRevgjTvo8Dc32iw_BLJPcPfRdVKhJT5HNzQuXEeN3QFwl2n0M6ZmO-h7C6eIqWsDnSrEd&lib=MwxUjRcLr2qLlnVOLh12wSNkqcO1Ikdrk";

chrome.storage.sync.get(['timer', 'serverTime', 'hour', 'minute', 'second', 'cardNumber', 'cvvNumber',
                        'month', 'year', 'checkoutDelay', 'refreshInterval', 'empty', 'items', 'cardType'], function(result) {

    var url = window.location.href; 
    if (url == "chrome-extension://ohbnlbmfcpflklecikkianpmjpikonmh/popup.html")
    {
        document.getElementsByClassName("checkoutDelay")[0].value = result.checkoutDelay;
        document.getElementsByClassName("refreshInterval")[0].value = result.refreshInterval;
        document.getElementsByClassName("emptyBasket")[0].checked = result.empty;
        document.getElementsByClassName("timer")[0].checked = result.timer;
        if (result.timer == true)
        {
            document.getElementById("serverTime").checked = result.serverTime;
            document.getElementById("hour").value = result.hour;
            document.getElementById("minute").value = result.minute;
            document.getElementById("second").value = result.second;
            document.getElementById("serverTime").type = "checkbox";
            document.getElementById("hour").type = "text";
            document.getElementById("minute").type = "text";
            document.getElementById("second").type = "text";
            document.getElementsByClassName("timeLabel")[0].style.display = 'block';
        }
        document.getElementsByClassName("creditNumber")[0].value = result.cardNumber;
        document.getElementsByClassName("cvvNumber")[0].value = result.cvvNumber;
        document.getElementsByClassName("month")[0].value = result.month;
        document.getElementsByClassName("year")[0].value = result.year;
        document.getElementsByClassName("cardType")[0].selectedIndex = result.cardType;

		if (result.items != null)
		{
			for (var i = 0; i < result.items[0].length - 1; i++)
				document.getElementsByClassName("addField")[0].click();
			

			for (var i = 0; i < document.getElementsByClassName("itemName").length; i++)
			{
				document.getElementsByClassName("itemName")[i].value = result.items[0][i];
				document.getElementsByClassName("category")[i].value = result.items[1][i];
				document.getElementsByClassName("size")[i].value = result.items[2][i];
				document.getElementsByClassName("color")[i].value = result.items[3][i];
				document.getElementsByClassName("anyColor")[i].checked = result.items[4][i];
			}
		}

    }

    else if (url.includes("supremenewyork.com"))
    {
        var BILLING_INFO = {
            // "full name": "Tomasz Kostowski",
            // "email": "tomek1kkgw@gmail.com",
            // "tel": "570650687",
            // "address": "Wegierska 1 m12",
            // "address 2": "",
            // "postcode": "02319",
            // "city": "Warsaw",
            "number": result.cardNumber,
            "cvv": result.cvvNumber
        }

        var items = result.items;

        for (var i = 0; i < items[0].length; i++)
        {
            items[0][i] = items[0][i].split(",");
            items[3][i] = items[3][i].split(",");
        }


        if (url == MAIN_URL) // main page
        {
            if (document.getElementById("cart").className == "hidden" || result.empty == false)
            {
                if (document.getElementById("cart").className == "hidden")
                    sessionStorage.setItem('beforeDrop', '0');
                else
                    sessionStorage.setItem('beforeDrop', document.getElementById("items-count").textContent[0]);
                sessionStorage.setItem('itemsAdded', '0');
                sessionStorage.setItem('itemsUnadded', '0');

                if (result.timer == true)
                {
                    if (result.serverTime == true)
                    {
                        fetch(TIME_SERVER_URL).then(timer => timer.json())
                        .then(timer => { 
                                var totalTime = ((result.hour - timer.hours - 2) * 3600000) + ((result.minute - timer.minutes) * 60000) + ((result.second - timer.seconds) * 1000);
                                console.log("Program will start in " + totalTime/1000 + " seconds");
                                //setTimeout("pickCategory(items[1][0])", totalTime);
                                setTimeout(function() { pickCategory(items[1][0]); }, totalTime);
                        });
                    }
                    else // LOCAL TIME
                    {
                        var today = new Date();
                        var totalTime = ((result.hour - today.getHours()) * 3600000) + ((result.minute - today.getMinutes()) * 60000) + ((result.second - today.getSeconds()) * 1000);
                        console.log("Program will start in " + totalTime/1000 + " seconds");
                        //setTimeout("pickCategory(items[1][0])", totalTime);
                        setTimeout(function() { pickCategory(items[1][0]); }, totalTime);
                    }
                }
                else
                {
                    pickCategory(items[1][0]);
                }
            }
        }
        else if (parseInt(sessionStorage.getItem('itemsAdded')) < items[0].length &&
            url == MAIN_URL + "/" + items[1][sessionStorage.getItem('itemsAdded')]) // category selected
        {
            console.log("in category");
            console.log("sending " + items[0][sessionStorage.getItem('itemsAdded')]);
            setTimeout(function(){}, 1000);
            pickItem(items[0][sessionStorage.getItem('itemsAdded')], items[3][sessionStorage.getItem('itemsAdded')], 
                    items[4][sessionStorage.getItem('itemsAdded')]);
        }
        else if (url.length > MAIN_URL.length + 15) // item selected
        {
            var x = parseInt(sessionStorage.getItem('itemsAdded')) + 1;
            sessionStorage.setItem('itemsAdded', x.toString());

            if (document.getElementById("add-remove-buttons").children[0].value != "add to basket")
            {
                sessionStorage.setItem('itemsUnadded', (parseInt(sessionStorage.getItem('itemsUnadded')) + 1).toString());
                if (x == items[0].length)
                    checkout();
                else
                    pickCategory(items[1][x]);
            }
            else
            {
                pickSize(items[2][x - 1]);
                document.getElementsByName("commit")[0].click();

                var p = setInterval(
                    function() 
                    { 
                        if (document.getElementById("cart").className != "hidden" &&
                            parseInt(document.getElementById("items-count").textContent[0]) ==
                            x + parseInt(sessionStorage.getItem('beforeDrop')) - parseInt(sessionStorage.getItem('itemsUnadded')))
                        {
                            clearInterval(p);
                            if (x == items[0].length)
                                checkout();
                            else
                                pickCategory(items[1][x]);
                        }
                    }, 50);
            }
        }
        else if (url == CHECKOUT_URL) // in checkout
        {
            autoFill(BILLING_INFO);
            setTimeout(function() { document.getElementsByName("commit")[0].click(); }, result.checkoutDelay);
        }

        function pickItem(name, color, anycolor)
        {
            var found = false;
            var products = document.getElementsByClassName('name-link');
            if (anycolor == false)
            {
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
            }
            else
            {
                for (var i = 0; i < products.length - 1; i++)
                {
                    for (var j = 0; j < name.length; j++)
                    {
                        if ((products[i].innerHTML).includes(name[j]))
                        {
                            found = true;
                            chrome.runtime.sendMessage({redirect: products[i].href});
                            break;
                        }
                    }
                }
            }
            if (found == false && sessionStorage.getItem('itemsAdded') != '0')
            {
                var x = parseInt(sessionStorage.getItem('itemsAdded')) + 1;
                sessionStorage.setItem('itemsAdded', x.toString());
                var y = parseInt(sessionStorage.getItem('itemsUnadded')) + 1;
                sessionStorage.setItem('itemsUnadded', y.toString());
                if (x == items[0].length)
                    checkout();
                else
                    pickCategory(items[1][x]);
            }
            else if (found == false)
                setTimeout(function() {location.reload();}, result.refreshInterval);
        }

        function autoFill(info)
        {
            var inputs = document.querySelectorAll('input:not([type=submit]):not([type=hidden])');
            inputs.forEach(function(element) 
            {
                var prev_sibling = element.previousElementSibling;
                if (prev_sibling != null) 
                {
                    var label_text = prev_sibling.innerHTML.toLowerCase();
                    var value = info[label_text];
                    if (value != null)
                        setInput(element, value);   
                }
            });
            if (result.cardType == 1) // MASTERCARD
                document.getElementById("credit_card_type").selectedIndex = 2;
            if (document.getElementById("order_billing_country").selectedIndex != 25)
                document.getElementById("order_billing_country").selectedIndex = 25;
            document.getElementById("credit_card_month").selectedIndex = result.month - 1;
            document.getElementById("credit_card_year").selectedIndex = result.year - 2019;
            document.getElementById("order_terms").checked = true;
            document.getElementById("order_terms").parentElement.classList.add('checked');
        }
        function pickCategory(cat)
{
    chrome.runtime.sendMessage({redirect: MAIN_URL + "/" + cat});
}

    }
});

function setInput(element, value) 
{
    element.focus();
    element.value = value;
    element.blur();
}



function checkout()
{
     chrome.runtime.sendMessage({redirect: CHECKOUT_URL});
}

function pickSize(size)
{
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

