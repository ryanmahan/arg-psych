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
computerName = "Devon"

// list of dictionaries with the win rate of the computer, and the action/amount that the computer takes
var computerPlay = [
  {win: false, action: null},
  {win: true, action: "spend", amount: 1},
  {win: true, action: "save"},
  {win: false, action: "save"},
  {win: false, action: "save"},
  {win: false, action: "spend", amount: 2}
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
// Do not change things below this line

// Stores all results from all rounds
var results = []
// Stores results from current round
var result = {}

var trial = 0

var t1 = 0
var t2 = 0

var hiddenElement = document.createElement('a');

// two params, min and a max, returns an inclusive random number
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// takes in red yellow or green, changes the stoplight color to that color
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

// updates HTML for conversion table
function createConversionTable() {
  let html = "<h5>"
  for(i = 1 ; i <= maxTokens ; i++) {
    html += i + " X <img class='token' src='images/token.png'/> = " + tokenConversion(i) + "<br>" 
  }
  return html + "</h5>"
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
  // creates buttons for each available amount of tokens to spend
  for(let i = 1 ; i <= player.tokens ; i++){
    if (i === 1) {
      $(".tokenmenu").append("<a class='dropdown-item' href='#'>1 Token</a>")
    } else {
      $(".tokenmenu").append("<a class='dropdown-item' href='#'>" + i + " Tokens</a>")
    }
  }
  
  // reinitialize the event listener
  $("#spendtoken a").one('click', function () {   
    t2 = Date.now()
    let amount = $(this).index()+1
    let points = tokenConversion(amount)
    result.amount = amount * -1
    result.action = "spend"
    updateTokens(player, amount * -1)
    updatePoints(com, points * -1)
    postAction()
  })

  // reinitialize the event listener
  $("#cashintoken a").one('click', function () {
    t2 = Date.now()
    let amount = $(this).index()+1
    let points = tokenConversion(amount)
    result.amount = amount
    result.action = "cash in"
    updateTokens(player, amount * -1)
    updatePoints(player, points)
    postAction()
  })
}

// helper function to run the postaction things, logging results, hiding the modal, running the next round
function postAction() {
  $("#winModal").modal('hide')
  result.playerposttokens = player.tokens
  result.playerpostpoints = player.points
  result.computerposttokens = com.tokens
  result.computerpostpoints = com.points
  result.responseTime = t2-t1
  startRound()
}

// computerWin works off the of the javascript object supplied by the researcher, a set win amount and action for each round the computer wins
function computerWin(action, amount) {
  result.action = action
  var points = 0
  
  if (action === "save") {
    updateTokens(com, 1)
    result.amount = 0
    $("#loseMessage").text("Devon decided to save a token.")
  }
    
  if (action === "cashin") {
    points = tokenConversion(amount)
    updateTokens(com, amount * -1)
    updatePoints(com, points)
    result.amount = amount
    $("#loseMessage").text("Devon decided to cash in a token.")
  }
    
  if (action === "spend") {
    points = tokenConversion(amount)
    updateTokens(com, (amount-1) * -1)
    updatePoints(player, points * -1)
    result.amount = (amount-1) * -1
    $("#loseMessage").text("Devon decided to spend a token.")
  }

  result.playerposttokens = player.tokens
  result.playerpostpoints = player.points
  result.computerposttokens = com.tokens
  result.computerpostpoints = com.points

  startRound()
}

// helper function that runs the round
function startRound() {
  // push last rounds results
  results.push(result)
  
  result = {}
  // if game is over, defined if the computer has no more preset moves
  if (computerPlay.length === trial) {
    $("#game").hide()
    $("#postgame").show()
  }
  // set up random delays for the stoplight
  let interval1 = getRandomIntInclusive(750, 1250)
  let interval2 = getRandomIntInclusive(750, 1250)
  interval2 += interval1
  greenTime = Date.now() + interval2
  setTimeout(changeLight, interval1, ["yellow"])
  setTimeout(changeLight, interval2, ["green"])
}

// runs when the document is loading, used to inistalize click event listeners and other variables
$(document).ready(function () {
  // show form and take in variables inputted by researcher
  $("#pregame").show()
  $(".conversions").html(createConversionTable())
  // set com name
  $("#comname").text(computerName)

  // uncomment this code if you want a form buton in the preform to change the computers name
  // $('#comdrop').change(function () {
  //   $("#comname").text($('#comdrop option:selected').text())
  //   result.comname = $('#comdrop option:selected').text()
  // })  

  // button in modal that will record a message sent by the user
  $("#sendmessage").click(function () {
    var text = $("#message").val()
    result.message = text
    $("#textmodal").modal("hide")
  })

  // button to download CSV
  $("#downloadbtn").click(function () {
    hiddenElement.click();
    hiddenElement.remove();
  })

  // save token button, doesnt need to be initialized with the other modal buttons because it never changes
  $("#savetoken").on("click", function () {
    result.action = "save"
    result.amount = 0
    t2 = Date.now()
    if (player.tokens >= maxTokens) {
      alert("Your bank is full")
    } else {
      postAction()
    }
  })

  // form submit for the inital form 
  $("#formsubmit").click(function () {
    $("#playername").text($("#name").val())
    result.playername = $("#name").val()
    result.id = $("#id").val()
    result.expirimenter = $("#expirimenter").val()
    // hide pregame and start the real game
    $("#pregame").hide()
    $("#game").show()
    $("#readyModal").modal({backdrop: 'static', keyboard: false})
  })

  // button when the user is ready to play, starts the first round
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
    // reset lose text
    $("#loseMessage").text("Waiting for the other player to make a decision...")
    // safegaurd if the user presses go too quickly
    if ($("#stoplight").attr('src') !== "images/green.jpg") {
      alert("You clicked too early! Try again")
      return
    }

    // log results
    var responseTime = Date.now() - greenTime
    result.responseTime = responseTime
    result.playerpretokens = player.tokens
    result.computerpretokens = com.tokens
    result.playerprepoints = player.points
    result.computerprepoints = com.points

    // computerPlay set up in dictionary, plus response time over 1 sec is a loss
    if (computerPlay[trial].win || responseTime > 1200) {
      result.winner = "computer"
      // computer wins
      $("#loseModal").modal({backdrop: 'static', keyboard: false})
      // set delay to make computer look natural
      let tout = getRandomIntInclusive(2000, 3800)
      // -1000 here so we can show the "chose to X" message
      window.setTimeout(
        computerWin,
        tout-1000,
        computerPlay[trial].action,
        computerPlay[trial].amount
      )
      window.setTimeout(
        () => {
          $("#loseModal").modal("hide")
      },
        tout
      )
      changeLight("red")
    } else {
      // player wins, player chooses action, round resets to red
      result.winner = "participant"
      updateTokens(player, 1)
      t1 = Date.now()
      $("#winModal").modal({backdrop: 'static', keyboard: false})
      changeLight("red")
    }
    result.trial = trial
    trial++

    // show modal to send a message if the flag is true
    if (sendmessage(trial)) {
      $("#textmodal").modal({backdrop: 'static', keyboard: false})
    }

  })

  // post game submit button
  $("#postgamesubmit").click(function () {
    let ids = ["frustrated", "happy", "confident", "angry", "satisfied", "confused",
            "trustworthy", "friendly", "smart", "fair", "identity"]
    let trigger = false

    // if any field is undefined, dont submit the form
    ids.forEach((id) => {
      if ($("#" + id + ":checked").val() == undefined) {
        trigger = true
      }
    })
    if (trigger) {
      alert("Please fill in all of the answers")
      return
    }
    // first line of the CSV
    let data = results[0].playername + ',' + results[0].id + ',' + results[0].expirimenter + "\n"
  
    data += format(results)
    data += getPostGameForm()

    // auto-download the CSV
    
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(data);
    hiddenElement.target = '_blank';
    hiddenElement.download = results[0].id + '.csv';
    document.body.appendChild(hiddenElement);
    $("#postgame").hide()
    $("#debriefing").show()
  })
})

// formats the results of the trial into a CSV format
function format(results) {
  var csv = 'Trial,Outcome,Winner,Response Time,Player Tokens Pre-response, Player Tokens Post-response, Player Points Pre-response, \
          Player Points Post-Response, Player Text, Computer Points Pre-response, Computer Points post-response\n'

  results.forEach(function(result) {
    csv += [result.trial, result.amount, result.responseTime, result.playerpretokens, result.playerposttokens,
            result.playerprepoints, result.playerpostpoints, result.message, result.computerprepoints, result.computerpostpoints].join(',')
    csv += "\n";
  })
  return csv
}

// formats the results of the post game form into a CSV format
function getPostGameForm() {
  data = "\n Post Game Form Answers \n"
  let ids = ["frustrated", "happy", "confident", "angry", "satisfied", "confused",
            "trustworthy", "friendly", "smart", "fair", "identity"]
  ids.forEach((id) => {
    data += id + ","
    data += $("#" + id + ":checked").val()
    data += "\n"
  })
  return data
}
