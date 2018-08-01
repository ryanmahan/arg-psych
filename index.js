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

function tokenConversion(amount) {
  return (95 + amount * 5) * amount
}


// GAME LOGIC

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
  console.log(actor.tokens)
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

  $("#savetoken").click(function () {
    if (player.tokens >= maxTokens) {
      alert("Your bank is full")
    } else {
      $("#winModal").modal('hide')
      startRound()
    }
  })

  $("#spendtoken a").click(function () {
    console.log('clicked')
    let amount = $(this).index()+1
    let points = tokenConversion(amount)
    updateTokens(player, (amount-1) * -1)
    updatePoints(com, points * -1)
    $("#winModal").modal('hide')
    startRound()
  })

  $("#cashintoken a").click(function () {
    let amount = $(this).index()+1
    let points = tokenConversion(amount)
    console.log(points)
    updateTokens(player, amount * -1)
    updatePoints(player, points)
    $("#winModal").modal('hide')
    startRound()
  })
}

// computerWin works off the of the dictionary supplied by the researcher, a set win amount and action for each round the computer wins
function computerWin(action, amount) {
  console.log(action)
  var points = 0
  if (action === "save") {
    updateTokens(com, 1)
  }
    
  if (action === "cashin") {
    points = tokenConversion(amount)
    updateTokens(com, amount * -1)
    updatePoints(com, points)
  }
    
  if (action === "spend") {
    points = tokenConversion(amount)
    updateTokens(com, (amount-1) * -1)
    updatePoints(player, points * -1)
  }
  startRound()
}

function startRound() {
  let interval1 = getRandomIntInclusive(500, 1000)
  let interval2 = getRandomIntInclusive(500, 1000)
  interval2 += interval1
  greenTime = Date.now() + interval2
  setTimeout(changeLight, interval1, ["yellow"])
  setTimeout(changeLight, interval2, ["green"])
}


$(document).ready(function () {
  // show form and take in variables inputted by researcher
  $("#form").show()
  var playername;
  $("#formsubmit").click(function () {
    // TODO: Save variables from this
    var playername = $("name").val()
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
  var trial = 0
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

    // computerPlay set up in dictionary, plus response time over 1 sec is a loss
    // TODO: Logic for action > 1sec response time that doesnt mess up researcher set dictionary (get token spend token)
    if (computerPlay[trial].win || responseTime > 1000) {
      // computer wins
      console.log(trial)
      $("#loseModal").modal("show")
      let tout = getRandomIntInclusive(1000, 2500)
      console.log(tout)
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
      updateTokens(player, 1)
      $("#winModal").modal('show')
      changeLight("red")
    }
    trial++
  })
})