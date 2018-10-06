//erl67
var buttons, addBtn, delBtn, addXBtn, delXBtn;
var delCatDiv, addCat, selectCat;
var delXDiv, xSelectCat, xName, xDate, xTotal;
var categories, transactions;

document.addEventListener("DOMContentLoaded", function() {
	window.onload = prepare;
});

function prepare() {
	buttons = document.getElementsByTagName("button");

	if (buttons.length > 1) {
		delBtn = document.getElementById("delCatBtn");
		delBtn.addEventListener("click", rmCat, true);
		addBtn = document.getElementById("addCatBtn");
		addBtn.addEventListener("click", sendCat, true);

		addXBtn = document.getElementById("addXBtn");
		addXBtn.addEventListener("click", sendTransaction, true);
		delXBtn = document.getElementById("delXBtn");
		delXBtn.addEventListener("click", rmTransaction, true);

		addCat = document.getElementById("addCat");
		selectCat = document.getElementById("delCat");
		xSelectCat = document.getElementById("xSelectCat");
		xSelectDel = document.getElementById("delX");

		delCatDiv = document.getElementById("delCatDiv");
		delXDiv = document.getElementById("delXDiv");

		xName = document.getElementById("xName");
		xDate = document.getElementById("xDate");
		xTotal = document.getElementById("xTotal");
	}
	updatePage();
}

function getCats() {
	var httpRequest = new XMLHttpRequest();

	httpRequest.onreadystatechange = function() {
		handleGetCats(httpRequest)
	};

	httpRequest.open("GET", "/api/cats", true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');

	httpRequest.send();
}

function handleGetCats(httpRequest) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {
			categories = httpRequest.responseText;
			if (categories.length > 5) {
				delCatDiv.classList.remove("d-none");
				addXDiv.classList.remove("d-none");
			} else {
				delCatDiv.classList.add("d-none");
				addXDiv.classList.add("d-none");
			}
		} else if (httpRequest.status === 401) {
		} else {
			alert("There was a problem with the get request.");
		}
		logStatus(httpRequest);
	}
}

function getTransactions() {
	var httpRequest = new XMLHttpRequest();

	httpRequest.onreadystatechange = function() {
		handleGetTransactions(httpRequest)
	};

	httpRequest.open("GET", "/api/transactions", true);
	httpRequest.setRequestHeader('Content-Type', 'application/json');

	httpRequest.send();
}

function handleGetTransactions(httpRequest) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {
			transactions = httpRequest.responseText;
			if (transactions.length > 5)
				delXDiv.classList.remove("d-none");
			else
				delXDiv.classList.add("d-none");
		} else if (httpRequest.status === 401) {
		} else {
			alert("There was a problem with the get request.");
		}
		logStatus(httpRequest);
	}
}

function sendCat() {
	var cat = addCat.value;
	var amount = catAmount.value== 0 ? 0 : catAmount.value;

	if (cat) {
		var data = new Object();
		data.category = cat;
		data.amount = amount;
		console.log(data)
		
		data = JSON.stringify(data);
	
		var httpRequest = new XMLHttpRequest();
	
		httpRequest.onreadystatechange = function() {
			handleSendCat(httpRequest, cat)
		};
	
		httpRequest.open("POST", "/api/cats", true);
		httpRequest.setRequestHeader('Content-Type', 'application/json');
	
		httpRequest.send(data);
	} else {
		alert("cannot leave category blank");
	}

}

function handleSendCat(httpRequest, cat) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 201) {
			addCat.value = "";

			var option = document.createElement("option");
			var option2 = document.createElement("option");
			option.text = cat;
			option2.text = cat;
			option.value = cat; //selectCat.length;
			option2.value = cat //xSelectCat.length;

			selectCat.add(option);
			xSelectCat.add(option2);
			updatePage();
		} else {
			alert("There was a problem with the post request.");
		}
		logStatus(httpRequest);
	}
}

function rmCat() {
	var httpRequest = new XMLHttpRequest();

	var cat = selectCat.value;

	if (cat) {
		httpRequest.onreadystatechange = function() {
			handleRmCat(httpRequest)
		};

		httpRequest.open("DELETE", "/api/cats", true);
		httpRequest.setRequestHeader('Content-Type', 'application/json');

		var data = new Object();
		data.category = cat;
		data = JSON.stringify(data);

		httpRequest.send(data);
	}
}

function handleRmCat(httpRequest) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 204) {
			xSelectCat.remove(selectCat.selectedIndex);
			selectCat.remove(selectCat.selectedIndex);
//			xSelectCat.remove(selectCat.value)
			updatePage();
		} else {
			alert("There was a problem with the delete request.");
		}
		logStatus(httpRequest);
	}
}

function rmTransaction() {
	var httpRequest = new XMLHttpRequest();

	var transact = delX.value;

	if (transact) {
		httpRequest.onreadystatechange = function() {
			handleRmTransaction(httpRequest, transact)
		};

		httpRequest.open("DELETE", "/api/transactions", true);
		httpRequest.setRequestHeader('Content-Type', 'application/json');

		var data = new Object();
		data.transaction = transact;
		data = JSON.stringify(data);

		httpRequest.send(data);
	}
}

function handleRmTransaction(httpRequest, transact) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 204) {
			xSelectDel.remove(xSelectDel.selectedIndex);
			updatePage();
			location.reload(); //only way to make pop work
		} else {
			alert("There was a problem with the delete request.");
		}
		logStatus(httpRequest);
	}
}

function sendTransaction() {
	var name = xName.value;
	var date = xDate.value == undefined ? new Date() : xDate.value;
	var total = xTotal.value;
	var cat = xSelectCat.options[xSelectCat.selectedIndex].text;
	cat = cat === 'Category' ? undefined : cat;

	var data = new Object();
	data.name = name;
	data.date = date;
	data.total = total;
	data.category = cat;

	if (isEmpty(data) == false) {
		alert("cannot leave anything blank")
	} else {
		data = JSON.stringify(data);

		var httpRequest = new XMLHttpRequest();

		httpRequest.onreadystatechange = function() {
			handleSendTransaction(httpRequest)
		};

		httpRequest.open("PUT", "/api/transactions", true);
		httpRequest.setRequestHeader('Content-Type', 'application/json');
		httpRequest.send(data);
	}
}

function handleSendTransaction(httpRequest) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 201) {
			xName.value = "";
			xDate.value = "";
			xTotal.value = "";
			xSelectCat.selectedIndex = 0;
			updatePage();
		} else {
			alert("There was a problem with the put request.");
		}
		logStatus(httpRequest);
	}
}

function logStatus(xhr) {
	if (xhr.responseText) {
		console.log("📡\t" + xhr.status + "\n"
				+ JSON.stringify(JSON.parse(xhr.responseText)));
	} else {
		console.log("📡\t" + xhr.status + "\t🛰️" + xhr.responseText);
	}
}

function isEmpty(obj) {
	for ( var o in obj) {
		if (obj[o] === undefined)
			return false;
	}
	return true;
}

function updatePage() {
	getCats();
	getTransactions();
	colorize([ 'page' ]);
	colorizeText([ 'page' ], true);
}
