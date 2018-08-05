// TRIAL VARIABLES

// starting values
var player = {
  tokens: 0,
  points: 5000,
  id: "player"
}

var com = {
  tokens: 0,
  points: 5000,
  id: "com"
}

// changing this number can cause issues with the display of the token bank
// FIXME: Display issues with token bank with variable token amounts, low priority
const maxTokens = 5

// list of dictionaries with the win rate of the computer, and the action/amount that the computer takes
var computerPlay = [
  {win: false, action: null},
  {win: true, action: "spend", amount: 1},
  {win: true, action: "save"},
  {win: false, action: "save"},
  {win: false, action: "save"}
]

// token conversion formula, amount being the amount of tokens spent, returns a number
function tokenConversion(amount) {
  return (95 + amount * 5) * amount
}

// define when the player is allowed to send a message, takes in trial number returns true/false
function sendmessage(trial) {
  return (trial%5 === 0 && trial !== 0)
}


// GAME LOGIC

// Stores all results from all rounds
var results = []
// Stores results from current round
var result = {}

var trial = 0

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function changeLight(color) {
  let path = 'images/' + color + '.jpg'
  $("#stoplight").attr('src', path)
}

// updates HTML for token banks and token dropdowns
function updateTokens(actor, amount=0) {
  actor.tokens += amount
  let html = ""
  for(let i = 0 ; i < actor.tokens ; i++) {
    html += "<img class='token' src='images/token.png'> \n"
  }
  for(let i = 0 ; i < maxTokens-actor.tokens ; i++) {
    html += "<img class='token' src='images/greyed.png'> \n"
  }
  let id = "#" + actor.id + "bank"
  $(id).html(html)
  tokenMenuMaker()
}

// updates actor's points by x amount, and updates HTML
function updatePoints(actor, amount) {
  actor.points += amount
  let id = "#" + actor.id + "points"
  $(id).text(actor.points)
  tokenMenuMaker()
}

// helper function to make dropdown menus for the token spend menu, and to init the button listeners
function tokenMenuMaker() {
  $(".tokenmenu").empty()
  var html =""
  for(let i = 1 ; i <= player.tokens ; i++){
    if (i === 1) {
      $(".tokenmenu").append("<a class='dropdown-item' href='#'>1 Token</a>")
    } else {
      $(".tokenmenu").append("<a class='dropdown-item' href='#'>" + i + " Tokens</a>")
    }
  }

  $("#spendtoken a").one('click', function () {   
    let amount = $(this).index()+1
    let points = tokenConversion(amount)
    result.amount = amount * -1
    result.action = "spend"
    updateTokens(player, (amount-1) * -1)
    updatePoints(com, points * -1)
    postAction()
  })

  $("#cashintoken a").one('click', function () {
    let amount = $(this).index()+1
    let points = tokenConversion(amount)
    result.amount = amount
    result.action = "cash in"
    updateTokens(player, amount * -1)
    updatePoints(player, points)
    postAction()
  })
}

function postAction() {
  $("#winModal").modal('hide')
  result.playerposttokens = player.tokens
  result.playerpostpoints = player.points
  result.computerposttokens = com.tokens
  result.computerpostpoints = com.points
  startRound()
}

// computerWin works off the of the dictionary supplied by the researcher, a set win amount and action for each round the computer wins
function computerWin(action, amount) {
  // TODO: Announce computer action
  result.action = action
  var points = 0
  if (action === "save") {
    updateTokens(com, 1)
    result.amount = 0
  }
    
  if (action === "cashin") {
    points = tokenConversion(amount)
    updateTokens(com, amount * -1)
    updatePoints(com, points)
    result.amount = amount
  }
    
  if (action === "spend") {
    points = tokenConversion(amount)
    updateTokens(com, (amount-1) * -1)
    updatePoints(player, points * -1)
    result.amount = (amount-1) * -1
  }
  result.playerposttokens = player.tokens
  result.playerpostpoints = player.points
  result.computerposttokens = com.tokens
  result.computerpostpoints = com.points
  
  startRound()
}

function startRound() {
  results.push(result)
  result = {}
  if (computerPlay.length === trial) {
    // TODO Post-game form
    console.log(results)
    endGame()
  }
  let interval1 = getRandomIntInclusive(750, 1250)
  let interval2 = getRandomIntInclusive(750, 1250)
  interval2 += interval1
  greenTime = Date.now() + interval2
  setTimeout(changeLight, interval1, ["yellow"])
  setTimeout(changeLight, interval2, ["green"])
}


$(document).ready(function () {
  // show form and take in variables inputted by researcher
  $("#form").show()

  // set com name
  $('#comdrop').change(function () {
    $("#comname").text($('#comdrop option:selected').text())
    result.comname = $('#comdrop option:selected').text()
  })  

  $("#formsubmit").click(function () {
    // TODO: Save variables from this
    $("#playername").text($("#name").val())
    result.playername = $("#name").val()
    result.id = $("#id").val()
    result.expirimenter = $("#expirimenter").val()
    $("#form").hide()
    $("#game").show()
    $("#readyModal").modal("show")
  })

  // button when the user is ready to play
  $("#readybutton").click(function() {
    $("#readyModal").modal("hide")
    startRound()
  })

  // initialize dynamic HTML parts

  $("#playerpoints").text(player.points)
  $("#compoints").text(com.points)
  updateTokens(player)
  updateTokens(com)
  $(".tokenmenu").dropdown();

  // button clicked (supposedly) after light is green and round has started, user either wins/loses based on this button
  $("#gobutton").click(function () {
    if ($("#stoplight").attr('src') !== "images/green.jpg") {
      alert("You clicked too early! Try again")
      return
    }

    var responseTime = Date.now() - greenTime
    result.responseTime = responseTime
    result.playerpretokens = player.tokens
    result.computerpretokens = com.tokens
    result.playerprepoints = player.points
    result.computerprepoints = com.points

    // computerPlay set up in dictionary, plus response time over 1 sec is a loss
    // TODO: Logic for action > 1sec response time that doesnt mess up researcher set dictionary (get token spend token)
    if (computerPlay[trial].win || responseTime > 1200) {
      result.winner = "computer"
      // computer wins
      $("#loseModal").modal("show")
      let tout = getRandomIntInclusive(1000, 2500)
      window.setTimeout(
        computerWin,
        tout,
        computerPlay[trial].action,
        computerPlay[trial].amount
      )
      window.setTimeout(
        () => {$("#loseModal").modal("hide")},
        tout
      )
      changeLight("red")
    } else {
      // player wins, player chooses action, round resets to red
      result.winner = "participant"
      updateTokens(player, 1)
      $("#winModal").modal('show')
      changeLight("red")
    }
    result.trial = trial
    trial++

    $("#savetoken").one('click', function () {
      result.action = "save"
      result.amount = 0
      if (player.tokens >= maxTokens) {
        alert("Your bank is full")
      } else {
        postAction()
      }
    })

    if (sendmessage(trial)) {
      $("#textmodal").modal("show")
    }

    $("#sendmessage").click(function () {
      var text = $("#message").val()
      result.message = text
      $("#textmodal").modal("hide")
    })

  })
})

function endGame() {
  console.log(results)
  var csv = results[0].playername + ',' + results[0].id + ',' + results[0].expirimenter

  csv += 'Trial,Outcome,Response,RT,Player Tokens Pre-response, Player Tokens Post-response, Player Points Pre-response, \
          Player Points Post-Response, Player Text, Computer Points Pre-response, Computer Points post-response\n';
  results.forEach(function(result) {
    csv += [results.trial, results.amount, results.responseTime, results.playerpretokens, results.playerposttokens,
            results.playerprepoints, results.playerpostpoints, results.message, results.computerprepoints, results.computerpostpoints].join(',')
    csv += "\n";
  });
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = results[0].id + '.csv';
    hiddenElement.click();
}