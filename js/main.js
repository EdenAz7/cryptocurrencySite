// Local Storage
function selectCoin(selectCoin) {
  localStorage.setItem("Coins", JSON.stringify(selectCoin));
}

function localStorageCoins() {
  return JSON.parse(localStorage.getItem("Coins")) || [];
  //if i share my project on another PC I need to reset the selectCoins. 
  //thats why I did the || -> JSON.parse(localStorage.getItem("Coins")) or []
  //and now automatically reset the local storage.
}

const selectedCoins = localStorageCoins();
let myData = [];
let lastCoinSelected = "";
let chartsData = {};
let chart;

$(function () {
  loadingPage(); //loading start
  // take coin's api
  $.ajax({
    url: "https://api.coingecko.com/api/v3/coins/",
    success: (card) => {
      myData = card;
      cards();
    },
    error: (err) => {
      alert(err.message);
      loadingPage("done"); //loading end
    },
  });
});

// card of coins and the collapse button
function cards() {
  const card = myData;
  let myCards = "";
  for (let i = 0; i < card.length; i++) {
    let checked = "";
    if (selectedCoins.indexOf(card[i].symbol) !== -1) {
      checked = "checked";
    }
    myCards += ` 
            <div class="card text-white m-3 col-6 cardCrypto" style="max-width: 12rem;">
                <div class="card-header text-dark d-flex justify-content-between">
                    <h6>${card[i].symbol}</h6>
                    <label class="switch switched">
                    <input type="checkbox" ${checked} onclick="toggleCoin(this,'${card[i].symbol}')">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="card-body">
                    <div class=" text-dark"> 
                        <h5 class="card-title">${card[i].name}</h5>
                    </div>
                    <button class="btn btn-dark btnInfo" type="button" data-toggle="collapse" data-target="#collapseMoreInfo${i}">
                        More Info
                    </button>
                    <div class="collapse" id="collapseMoreInfo${i}">
                        <div class="card card-body coinInfo">
                            ${card[i].market_data.current_price.eur}€<br>
                            ${card[i].market_data.current_price.usd}$<br>
                            ${card[i].market_data.current_price.ils}₪<br>
                            <img src="${card[i].image.small}" alt="coinImg">
                        </div>
                    </div>
                </div>
                </div>`;
    $(".cards").html(myCards);
  };
  loadingPage("done"); //loading end
};

// Search bar Start
$(".searchSub").click((e) => {
  loadingPage(); //loading start
  e.preventDefault();
  if ($("#myInput").val() != "") {
    $(".cards").empty();
    showCoinDetails();
  } else {
    alert("Put coin name!");
    loadingPage("done"); //loading end
  }
});

function showCoinDetails() {
  const textCoin = $("#myInput").val();
  $.ajax({
    // search with symbol or id for example BTC/bitcoin
    url: `https://api.coingecko.com/api/v3/search?query=${textCoin}`,
    success: (response) => {
      if (response.coins.length == 0) {
        alert("The coin name that you enter is not valid");
        loadingPage("done");//loading end
        return;
      }
      $.ajax({
        url: `https://api.coingecko.com/api/v3/coins/${response.coins[0].id}`,
        success: (coin) => {
          takeData(coin);
        },
        error: () => {
          alert("The coin name that you enter is not valid");
          loadingPage("done"); //loading end
        },
      });
    },
    error: () => {
      alert("The coin name that you enter is not valid");
      loadingPage("done"); //loading end
    }
  });
};

function takeData(coin) {
  let checked = "";
  if (selectedCoins.indexOf(coin.symbol) !== -1) {
    checked = "checked";
  }
  let cardCoin = ` 
            <div class="card text-white m-3 col-6 cardCrypto" style="max-width: 12rem;">
                <div class="card-header text-dark d-flex justify-content-between">
                    <h6>${coin.symbol}</h6>
                    <label class="switch switched notClicked">
                    <input type="checkbox" ${checked} onclick="toggleCoin(this,'${coin.symbol}')">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="card-body">
                    <div class=" text-dark"> 
                        <h5 class="card-title">${coin.name}</h5>
                    </div>
                    <button class="btn btn-dark btnInfo" type="button" data-toggle="collapse" data-target="#collapseMoreInfo">
                        More Info
                    </button>
                    <div class="collapse" id="collapseMoreInfo">
                        <div class="card card-body coinInfo">
                            ${coin.market_data.current_price.eur}€<br>
                            ${coin.market_data.current_price.usd}$<br>
                            ${coin.market_data.current_price.ils}₪<br>
                            <img src="${coin.image.small}" alt="coinImg">
                        </div>
                    </div>
                </div>
            </div>`;
  $(".cards").append(cardCoin);
  loadingPage("done"); //loading end
};

// Bring Page From About.html
$(".about").click(async function () {
  loadingPage(); //Start Load
  const response = await fetch("About.html");
  const html = await response.text();
  $("#htmlTemplate").html(html);
  loadingPage("done"); //Stop Load
});
// Bring Page From LiveReports.html
$(".liveReports").click(async function () {
  loadingPage(); //Start Load
  const response = await fetch("LiveReports.html");
  const html = await response.text();
  $("#htmlTemplate").html(html);
  createChart();
  loadingPage("done"); //Stop Load
});
//checked more than 5 coins && show modal
function toggleCoin(el, symbol) {
  if (el.checked === true && selectedCoins.length === 5) {
    el.checked = false;
    lastCoinSelected = symbol;
    let myCards = "";
    for (let i = 0; i < selectedCoins.length; i++) {
      const currCoinSymbol = selectedCoins[i];
      const currCoin = myData.find((coin) => coin.symbol === currCoinSymbol);
      myCards += `<div class="card col-12 col-md-6 col-lg-4 text-center" style="width: 18rem;">
              <div class="card-body">
                  <label class="switch">
                  <input type="checkbox" checked onclick="toggleCoin(this,'${currCoin.symbol}'); cards()">
                  <span class="slider round"></span>
                  </label>
                  <h5 class="card-title">${currCoin.name}</h5>
                  <hr>
                  <p class="card-text">${currCoin.symbol}</p>
              </div>
          </div>`;
    }
    $(".modal-body").html(myCards);
    $("#myModal").modal("show");
    return;
  };

  if (selectedCoins.includes(symbol)) {
    const index = selectedCoins.indexOf(symbol);
    selectedCoins.splice(index, 1);
  } else {
    selectedCoins.push(symbol);
  };
  selectCoin(selectedCoins);
};
function onSave() {
  if (lastCoinSelected && selectedCoins.length < 5) {
    selectedCoins.push(lastCoinSelected);
    lastCoinSelected = "";
    cards();
  }
};

//loading page function
function loadingPage(done) {
  done
    ? $(".screen").fadeOut(2000)
    : $("body").append(
      `<div class="screen">
          <div class="loadimg-screens">
              <img src="image/load.gif" class="loadimg-screen" alt="">
          </div>
      </div>`
    );
};


// LiveReports
const createChart = () => {
  $.ajax({
    url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins.join(
      ","
    )}&tsyms=USD,EUR$api_key=767fcb4fa4f239d141bbc774069cb70c14971ad503b4f2e3f6c416ec37ed38b1`,
    success: (response) => {
      let chartData = [];
      for (let allkeys in response) {
        chartsData[allkeys] = {
          type: "splineArea",
          showInLegend: true,
          name: allkeys,
          yValueFormatString: "$#,##0",
          xValueFormatString: "MMM YYYY",
          dataPoints: [{ x: new Date(), y: response[allkeys].USD }],
        };
        chartData.push(chartsData[allkeys]);
      }
      const options = {
        animationEnabled: true,
        theme: "light2",
        title: {
          text: "Live Reports",
        },
        axisY: {
          includeZero: false,
          prefix: "$",
          lineThickness: 0,
        },
        legend: {
          cursor: "pointer",
        },
        toolTip: {
          shared: true,
        },
        data: chartData,
      };
      chart = new CanvasJS.Chart("chartContainer", options);
      chart.render();
      chartsInterval = setInterval(() => {
        updateChart();
      }, 2000);
    },
  });
};

function updateChart() {
  $.ajax({
    url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins.join(
      ","
    )}&tsyms=USD,EUR$api_key=7e922d3370e168a25844d768a1b5b3d5c7bad849d97774550b53f87db5528093`,
    success: (response) => {
      let i = 0;
      for (let key in response) {
        const currCoin = response[key];
        chart.options.data[i].dataPoints.push({
          x: new Date(),
          y: response[key].USD,
        });
        i++;
      }
      chart.render();
    },
  });
};
