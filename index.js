// TRIAL VARIABLES

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

const maxTokens = 5
const rounds = 5

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

// FORM INPUT



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

// updates HTML for tokens
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
  $("#form").show()
  var playername;
  $("#formsubmit").click(function () {
    // TODO: Save variables from this
    var playername = $("name").val()
    $("#form").hide()
    $("#game").show()
    $("#readyModal").modal("show")
  })

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

  $("#gobutton").click(function () {
    if (greenTime === 0) {
      alert("Click \"Start Round\" before pressing go")
      return
    }
    if ($("#stoplight").attr('src') !== "images/green.jpg") {
      alert("You clicked too early! Try again")
      return
    }

    if (computerPlay[trial].win) {
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
      var responseTime = Date.now() - greenTime
      if (responseTime < 1000) {
        updateTokens(player, 1)
        $("#winModal").modal('show')
        changeLight("red")
      }
      
    }

    //  player wins

    trial++
  })

  
})