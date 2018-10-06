//erl67
//this uses the same AJAX as before, only to GET the data
//and the response is automatically parsed to JSON
var categories = {}, transactions = {};
var cats = Array();
var catsDiv, totalCatsDiv;
var totalX, xNames;
var perCatX, perCatRemaining, totalPerCatX;
var temp, temp2;

document.addEventListener("DOMContentLoaded", function() {
	window.onload = prepare;
});

function prepare() {
	updatePage();

	catsDiv = document.getElementById('cats');
	totalCatsDiv = document.getElementById('totalCats');
	totalX = document.getElementById('totalX');
	xNames = document.getElementById('xNames');
	
	perCatX = document.getElementById('perCatX');
	totalPerCatX = document.getElementById('totalPerCatX');
	perCatRemaining = document.getElementById('perCatRemaining');

	setTimeout(function() {
		if (categories){
			populateCats(categories);
			totalCats(categories);
		}
		if (transactions) {
			totalTransactions(transactions);
			transactionNames(transactions);
		}
		if (categories && transactions) {
			perCategory(categories, transactions);
			totalCategory(categories, transactions);
			remainingCategory(categories, transactions);
		}
		updatePage();
	}, 1000);
}

function remainingCategory(arr, arrX) {
	temp = Object.keys(arr);
	temp = temp.sort();
	temp2 = Array(temp.length);
	temp2.fill(0.0);
	var temp4;
	
	for (var cat in temp) {
		Object.keys(arrX).map(function(key, index) {
			if (arrX[key].category == temp[cat]) {
				return temp2[cat] = temp2[cat] + parseFloat(arrX[key].total);
			}
		});
	}
	
	var temp4 = Object.keys(arr).map(function(key, index) {
		var remainder = parseFloat(arr[key]) - parseFloat(temp2[index]);
		var s = temp[index] + " ($" +  remainder.toFixed(2) + ")" + "<br>";
		return s;
	});
	
	console.log(temp4)
	temp4 = temp4.toString().replace(/,/g, '')
	
	perCatRemaining.innerHTML =  perCatRemaining.innerHTML + '<br/>' + temp4;

//	for (var cat in temp) {
//			remainder = parseFloat(arr[cat]);
//			console.log ()
//			//parseFloat(temp2[cat])
//			perCatRemaining.innerHTML =  perCatRemaining.innerHTML + '<br/>' + temp[cat] + "  -  $" + remainder.toFixed(2);
//	}
}

function totalCategory(arr, arrX) {
	temp = Object.keys(arr);
	temp = temp.sort();
	temp2 = Array(temp.length);
	temp2.fill(0);
	
	for (var cat in temp) {
		Object.keys(arrX).map(function(key, index) {
			if (arrX[key].category == temp[cat]) {
				return temp2[cat] = parseFloat(temp2[cat]) + parseFloat(arrX[key].total);
			}
		});
	}
	
	for (var cat in temp) {
		if (temp2[cat] !== 0) {
			totalPerCatX.innerHTML =  totalPerCatX.innerHTML + '<br/>' + temp[cat] + "  -  $" + parseFloat(temp2[cat]).toFixed(2);
 		}
	}
}

function perCategory(arr, arrX) {
	temp = Object.keys(arr);
	temp = temp.sort();
	temp2 = Array(temp.length);
	temp2.fill(0);
	
	for (var cat in temp) {
		Object.keys(arrX).map(function(key, index) {
			if (arrX[key].category == temp[cat]) {
				return temp2[cat] = temp2[cat] + 1;
			}
		});
	}
	
	for (var cat in temp) {
		if (temp2[cat] !== 0) {
			perCatX.innerHTML =  perCatX.innerHTML + '<br/>' + temp[cat] + " = " + temp2[cat];
 		}
	}
}

function transactionNames(arr) {
	temp = Object.keys(arr).map(function(key, index) {
		return arr[key].name;
	});
	temp = temp.sort().toString().replace(/,/g, ',  ');
	xNames.innerHTML += temp;
}

function populateCats(arr) {
	temp = Object.keys(arr).map(function(key, index) {
		var s = key + " ($" +  parseInt(arr[key]).toFixed(2) + ")";
		return s;
	});

	temp = temp.sort().toString().replace(/,/g, ',  ');
	catsDiv.innerHTML += temp;
	cats = temp;
}

function totalCats(arr) {
	temp = Object.keys(arr).reduce(function(acc, cv) {
		return parseInt(acc) + 1
	}, 0);
	totalCatsDiv.innerHTML += temp;
}

function totalTransactions(arr) {
	temp = Object.keys(arr).reduce(function(acc, cv) {
		return parseInt(acc) + 1
	}, 0);
	totalX.innerHTML += temp;
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
			categories = httpRequest.responseText ? JSON
					.parse(httpRequest.responseText) : httpRequest.responseText;
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
			transactions = httpRequest.responseText ? JSON
					.parse(httpRequest.responseText) : httpRequest.responseText;
		} else if (httpRequest.status === 401) {
		} else {
			alert("There was a problem with the get request.");
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

function updatePage() {
	getCats();
	getTransactions();
	colorize(['page']);
	colorizeText(['page'], true);
}
